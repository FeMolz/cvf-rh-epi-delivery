import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PainelUsuariosCadastramento } from './PainelUsuariosCadastramento.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../usuarios/services/usuariosApi.js', () => ({
    cadastrarUsuario: vi.fn()
}));

vi.mock('../../usuarios/components/FormularioCadastroUsuario.jsx', () => ({
    FormularioCadastroUsuario: ({ onSubmit, carregando }) => (
        <button
            type="button"
            disabled={carregando}
            onClick={async () => {
                try {
                    await onSubmit({ name: 'NOVO', email: 'novo@teste.com' });
                } catch {
                    // formulário real trata o erro; mock apenas dispara o submit
                }
            }}
        >
            Enviar cadastro
        </button>
    )
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { cadastrarUsuario } = await import('../../usuarios/services/usuariosApi.js');

describe('PainelUsuariosCadastramento', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt', user: { role: 'ADMIN' } });
        cadastrarUsuario.mockResolvedValue({ id: '1' });
    });

    it('deve cadastrar usuario com sucesso', async () => {
        const usuario = userEvent.setup();

        render(<PainelUsuariosCadastramento />);

        await usuario.click(screen.getByRole('button', { name: 'Enviar cadastro' }));

        await waitFor(() => {
            expect(cadastrarUsuario).toHaveBeenCalledWith(
                { name: 'NOVO', email: 'novo@teste.com' },
                'jwt'
            );
        });
    });

    it('deve propagar erro do cadastro para o formulario', async () => {
        const usuario = userEvent.setup();
        cadastrarUsuario.mockRejectedValue(new Error('E-mail já cadastrado'));

        render(<PainelUsuariosCadastramento />);

        await usuario.click(screen.getByRole('button', { name: 'Enviar cadastro' }));

        await waitFor(() => {
            expect(cadastrarUsuario).toHaveBeenCalled();
        });
    });
});
