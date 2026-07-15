import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormularioLogin } from './FormularioLogin.jsx';

describe('FormularioLogin', () => {
    it('deve chamar onSubmit com e-mail e senha', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<FormularioLogin onSubmit={onSubmit} />);

        await usuario.type(screen.getByLabelText(/e-mail corporativo/i), 'admin@teste.com');
        await usuario.type(screen.getByLabelText(/^senha$/i), 'senha1234');
        await usuario.click(screen.getByRole('button', { name: /entrar/i }));

        expect(onSubmit).toHaveBeenCalledWith({
            email: 'admin@teste.com',
            password: 'senha1234'
        });
    });

    it('deve exibir erro retornado pela API', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockRejectedValue(new Error('Credenciais inválidas.'));

        render(<FormularioLogin onSubmit={onSubmit} />);

        await usuario.type(screen.getByLabelText(/e-mail corporativo/i), 'a@b.com');
        await usuario.type(screen.getByLabelText(/^senha$/i), 'senha1234');
        await usuario.click(screen.getByRole('button', { name: /entrar/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas.');
    });

    it('deve exibir erro generico e estado de carregamento', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockRejectedValue(new Error());

        const { rerender } = render(<FormularioLogin onSubmit={onSubmit} />);

        await usuario.type(screen.getByLabelText(/e-mail corporativo/i), 'a@b.com');
        await usuario.type(screen.getByLabelText(/^senha$/i), 'senha1234');
        await usuario.click(screen.getByRole('button', { name: /entrar/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível entrar.');

        rerender(<FormularioLogin onSubmit={onSubmit} carregando />);

        expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled();
    });

    it('deve limpar erro apos timeout', async () => {
        vi.useFakeTimers();
        const onSubmit = vi.fn().mockRejectedValue(new Error('Falha'));

        render(<FormularioLogin onSubmit={onSubmit} />);

        fireEvent.change(screen.getByLabelText(/e-mail corporativo/i), {
            target: { value: 'a@b.com' }
        });
        fireEvent.change(screen.getByLabelText(/^senha$/i), {
            target: { value: 'senha1234' }
        });
        fireEvent.submit(screen.getByRole('button', { name: /entrar/i }).closest('form'));

        await act(async () => {
            await Promise.resolve();
        });

        expect(screen.getByRole('alert')).toHaveTextContent('Falha');

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        vi.useRealTimers();
    });
});
