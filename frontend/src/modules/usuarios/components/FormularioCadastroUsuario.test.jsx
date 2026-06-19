import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormularioCadastroUsuario } from './FormularioCadastroUsuario.jsx';

describe('FormularioCadastroUsuario', () => {
    it('deve listar apenas papéis permitidos', () => {
        render(
            <FormularioCadastroUsuario
                papeisDisponiveis={['ADMINISTRATIVO', 'COLABORADOR']}
                onSubmit={vi.fn()}
            />
        );

        expect(screen.getByRole('option', { name: 'Administrativo' })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: 'Administrador' })).not.toBeInTheDocument();
    });

    it('deve enviar dados do formulário', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <FormularioCadastroUsuario
                papeisDisponiveis={['ADMINISTRATIVO', 'COLABORADOR']}
                onSubmit={onSubmit}
            />
        );

        await usuario.type(screen.getByLabelText(/nome completo/i), 'João Teste');
        await usuario.type(screen.getByLabelText(/^e-mail$/i), 'joao@teste.com');
        await usuario.type(screen.getByLabelText(/senha inicial/i), 'senha1234');
        await usuario.click(screen.getByRole('button', { name: /cadastrar usuário/i }));

        expect(onSubmit).toHaveBeenCalledWith({
            name: 'João Teste',
            email: 'joao@teste.com',
            password: 'senha1234',
            role: 'COLABORADOR'
        });
    });
});
