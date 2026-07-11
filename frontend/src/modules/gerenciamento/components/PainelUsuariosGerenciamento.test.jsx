import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import * as MensagemFeedback from '../../../shared/components/MensagemFeedback.jsx';
import { PainelUsuariosGerenciamento } from './PainelUsuariosGerenciamento.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../../shared/components/DialogoConfirmacao.jsx', () => ({
    DialogoConfirmacao: () => null
}));

vi.mock('../../funcionarios/services/empresasApi.js', () => ({
    listarEmpresas: vi.fn()
}));

vi.mock('../../usuarios/services/usuariosApi.js', () => ({
    cadastrarUsuario: vi.fn(),
    listarUsuarios: vi.fn(),
    excluirUsuario: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarEmpresas } = await import('../../funcionarios/services/empresasApi.js');
const { cadastrarUsuario, listarUsuarios } = await import('../../usuarios/services/usuariosApi.js');

describe('PainelUsuariosGerenciamento', () => {
    function renderizarPainel() {
        return render(
            <MemoryRouter>
                <PainelUsuariosGerenciamento />
            </MemoryRouter>
        );
    }

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            token: 'jwt',
            user: { id: '1', role: 'ADMINISTRATIVO' }
        });
        listarUsuarios.mockResolvedValue([
            { id: '2', name: 'Maria', email: 'maria@teste.com', role: 'COLABORADOR' }
        ]);
        listarEmpresas.mockResolvedValue([{ id: 'emp-1' }, { id: 'emp-2' }]);
        cadastrarUsuario.mockResolvedValue({ id: '3' });
    });

    it('deve carregar usuarios cadastrados', async () => {
        renderizarPainel();

        expect(await screen.findByText('Usuários cadastrados')).toBeInTheDocument();
        expect(screen.getByText('Maria')).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        listarUsuarios.mockRejectedValue(new Error('Erro ao listar.'));

        renderizarPainel();

        expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao listar.');
    });

    it('deve continuar carregando usuarios quando empresas falharem', async () => {
        listarEmpresas.mockRejectedValue(new Error('Empresas indisponíveis.'));

        renderizarPainel();

        expect(await screen.findByText('Maria')).toBeInTheDocument();
    });

    it('deve cadastrar usuario e recarregar lista', async () => {
        const usuario = userEvent.setup();

        renderizarPainel();

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        await usuario.type(screen.getByLabelText(/identificador \/ e-mail/i), 'novo@teste.com');
        await usuario.type(screen.getByLabelText(/senha inicial/i), 'Senha@123');
        await usuario.click(screen.getByRole('button', { name: /criar novo acesso/i }));

        await waitFor(() => {
            expect(cadastrarUsuario).toHaveBeenCalled();
        });

        expect(listarUsuarios).toHaveBeenCalledTimes(2);
    });

    it('deve usar mensagem padrao quando listagem falhar sem message', async () => {
        listarUsuarios.mockRejectedValue({});

        renderizarPainel();

        expect(await screen.findByRole('alert')).toHaveTextContent(
            /não foi possível carregar os usuários/i
        );
    });

    it('deve exibir erro padrao ao falhar cadastro', async () => {
        const usuario = userEvent.setup();
        cadastrarUsuario.mockRejectedValueOnce({});

        renderizarPainel();

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        await usuario.type(screen.getByLabelText(/identificador \/ e-mail/i), 'novo@teste.com');
        await usuario.type(screen.getByLabelText(/senha inicial/i), 'Senha@12345');
        await usuario.click(screen.getByRole('button', { name: /criar novo acesso/i }));

        await waitFor(() => {
            expect(cadastrarUsuario).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(
                screen.getAllByText(/não foi possível cadastrar o usuário/i).length
            ).toBeGreaterThan(0);
        });
    });

    it('deve limpar erro via callback do feedback', async () => {
        const original = MensagemFeedback.AreaMensagensFeedback;
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.erro && props.onLimparErro) {
                props.onLimparErro();
            }

            return original(props);
        });

        listarUsuarios.mockRejectedValue(new Error('Erro ao listar.'));

        renderizarPainel();

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });
});
