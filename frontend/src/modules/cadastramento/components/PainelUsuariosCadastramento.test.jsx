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

vi.mock('../../../shared/components/MensagemFeedback.jsx', () => ({
    AreaMensagensFeedback: ({ erro = '', sucesso = '', onLimparErro, onLimparSucesso }) => (
        <>
            {erro ? (
                <div>
                    <p role="alert">{erro}</p>
                    <button type="button" onClick={onLimparErro}>
                        limpar-erro
                    </button>
                </div>
            ) : null}
            {sucesso ? (
                <div>
                    <p role="status">{sucesso}</p>
                    <button type="button" onClick={onLimparSucesso}>
                        limpar-sucesso
                    </button>
                </div>
            ) : null}
        </>
    )
}));

vi.mock('../../usuarios/components/FormularioCadastroUsuario.jsx', () => ({
    FormularioCadastroUsuario: ({ onSubmit }) => (
        <button
            type="button"
            onClick={async () => {
                try {
                    await onSubmit({ name: 'Novo', email: 'novo@teste.com' });
                } catch {
                    // aoCadastrar relança o erro após atualizar o estado
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
                { name: 'Novo', email: 'novo@teste.com' },
                'jwt'
            );
        });

        expect(screen.getByText('Usuário cadastrado com sucesso.')).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar cadastro', async () => {
        const usuario = userEvent.setup();
        cadastrarUsuario.mockRejectedValue(new Error('E-mail já cadastrado'));

        render(<PainelUsuariosCadastramento />);

        await usuario.click(screen.getByRole('button', { name: 'Enviar cadastro' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('E-mail já cadastrado');
    });

    it('deve exibir erro generico ao falhar cadastro', async () => {
        const usuario = userEvent.setup();
        cadastrarUsuario.mockRejectedValue(new Error());

        render(<PainelUsuariosCadastramento />);

        await usuario.click(screen.getByRole('button', { name: 'Enviar cadastro' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível cadastrar o usuário.');
    });

    it('deve limpar mensagens de erro e sucesso', async () => {
        const usuario = userEvent.setup();

        render(<PainelUsuariosCadastramento />);

        await usuario.click(screen.getByRole('button', { name: 'Enviar cadastro' }));

        expect(await screen.findByRole('status')).toHaveTextContent('Usuário cadastrado com sucesso.');

        await usuario.click(screen.getByRole('button', { name: 'limpar-sucesso' }));

        expect(screen.queryByRole('status')).not.toBeInTheDocument();

        cadastrarUsuario.mockRejectedValue(new Error('E-mail já cadastrado'));

        await usuario.click(screen.getByRole('button', { name: 'Enviar cadastro' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('E-mail já cadastrado');

        await usuario.click(screen.getByRole('button', { name: 'limpar-erro' }));

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
