import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
