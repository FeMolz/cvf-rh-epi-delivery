import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CampoSenha } from './CampoSenha.jsx';

describe('CampoSenha', () => {
    it('deve alternar entre ocultar e exibir a senha', async () => {
        const usuario = userEvent.setup();
        const onChange = vi.fn();

        render(
            <CampoSenha
                id="senha-teste"
                rotulo="Senha"
                value="senha1234"
                onChange={onChange}
            />
        );

        const campo = screen.getByLabelText(/^senha$/i);
        expect(campo).toHaveAttribute('type', 'password');

        await usuario.click(screen.getByRole('button', { name: /exibir senha/i }));
        expect(campo).toHaveAttribute('type', 'text');
        expect(screen.getByRole('button', { name: /ocultar senha/i })).toHaveAttribute(
            'aria-pressed',
            'true'
        );

        await usuario.click(screen.getByRole('button', { name: /ocultar senha/i }));
        expect(campo).toHaveAttribute('type', 'password');
    });

    it('deve propagar alteração do valor', async () => {
        const usuario = userEvent.setup();
        const onChange = vi.fn();

        render(
            <CampoSenha id="senha-teste" rotulo="Senha" value="" onChange={onChange} />
        );

        await usuario.type(screen.getByLabelText(/^senha$/i), 'abc');

        expect(onChange).toHaveBeenCalled();
    });
});
