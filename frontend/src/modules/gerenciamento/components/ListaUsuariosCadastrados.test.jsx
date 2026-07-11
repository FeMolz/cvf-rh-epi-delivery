import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { ListaUsuariosCadastrados } from './ListaUsuariosCadastrados.jsx';

const { confirmarExclusaoCapturada } = vi.hoisted(() => ({
    confirmarExclusaoCapturada: { current: () => {} }
}));

vi.mock('../../../shared/components/MensagemFeedback.jsx', () => ({
    AreaMensagensFeedback: ({ erro = '', onLimparErro }) =>
        erro ? (
            <div>
                <p role="alert">{erro}</p>
                <button type="button" onClick={onLimparErro}>
                    limpar-erro
                </button>
            </div>
        ) : null
}));

vi.mock('../../../shared/components/DialogoConfirmacao.jsx', () => ({
    DialogoConfirmacao: ({ aberto, onConfirmar, onCancelar }) => {
        confirmarExclusaoCapturada.current = onConfirmar;

        if (!aberto) {
            return null;
        }

        return (
            <>
                <button type="button" onClick={onCancelar}>
                    Cancelar
                </button>
                <button type="button" onClick={onConfirmar}>
                    Excluir
                </button>
            </>
        );
    }
}));

vi.mock('../../usuarios/services/usuariosApi.js', () => ({
    excluirUsuario: vi.fn()
}));

const { excluirUsuario } = await import('../../usuarios/services/usuariosApi.js');

describe('ListaUsuariosCadastrados', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        confirmarExclusaoCapturada.current = () => {};
        excluirUsuario.mockResolvedValue(undefined);
    });

    it('deve listar usuários com ações', () => {
        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    totalEmpresas={3}
                    usuarios={[
                        {
                            id: '10',
                            name: 'João Silva',
                            email: 'joao@teste.com',
                            role: 'ADMINISTRATIVO'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText(/Administrativo · 3 empresas/)).toBeInTheDocument();
        expect(screen.getByText('1 usuário')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/admin/usuarios/10');
    });

    it('deve exibir estado vazio e badge plural', () => {
        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados token="token" usuarios={[]} />
            </MemoryRouter>
        );

        expect(screen.getByText('Nenhum usuário cadastrado ainda.')).toBeInTheDocument();
        expect(screen.getByText('0 usuários')).toBeInTheDocument();
    });

    it('deve exibir subtexto sem empresas e papel desconhecido', () => {
        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    totalEmpresas={1}
                    usuarios={[
                        {
                            id: '11',
                            email: 'ana@teste.com',
                            role: 'PAPEL_CUSTOM'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('ana@teste.com')).toBeInTheDocument();
        expect(screen.getByText('PAPEL_CUSTOM · 1 empresa')).toBeInTheDocument();
        expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('deve usar inicial padrao quando nome estiver vazio', () => {
        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    usuarios={[
                        {
                            id: '12',
                            name: '   ',
                            role: 'COLABORADOR'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('?')).toBeInTheDocument();
        expect(screen.getByText('Colaborador')).toBeInTheDocument();
    });

    it('deve desabilitar exclusao do proprio usuario', () => {
        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    usuarioAtualId="10"
                    usuarios={[
                        {
                            id: '10',
                            name: 'João Silva',
                            email: 'joao@teste.com',
                            role: 'ADMINISTRATIVO'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByRole('button', { name: /excluir/i })).toBeDisabled();
    });

    it('deve confirmar exclusao com sucesso', async () => {
        const usuario = userEvent.setup();
        const onUsuarioRemovido = vi.fn();

        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    onUsuarioRemovido={onUsuarioRemovido}
                    usuarios={[
                        {
                            id: '10',
                            name: 'João Silva',
                            email: 'joao@teste.com',
                            role: 'ADMINISTRATIVO'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        await usuario.click(screen.getByTitle('Excluir usuário'));
        await usuario.click(screen.getAllByRole('button', { name: /^excluir$/i })[1]);

        await waitFor(() => {
            expect(excluirUsuario).toHaveBeenCalledWith('10', 'token');
            expect(onUsuarioRemovido).toHaveBeenCalled();
        });
    });

    it('deve exibir erro ao falhar exclusao', async () => {
        const usuario = userEvent.setup();
        excluirUsuario.mockRejectedValue(new Error('Erro ao excluir.'));

        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    usuarios={[
                        {
                            id: '10',
                            name: 'João Silva',
                            email: 'joao@teste.com',
                            role: 'ADMINISTRATIVO'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        await usuario.click(screen.getByTitle('Excluir usuário'));
        await usuario.click(screen.getAllByRole('button', { name: /^excluir$/i })[1]);

        expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao excluir.');
    });

    it('deve exibir erro generico ao falhar exclusao', async () => {
        const usuario = userEvent.setup();
        excluirUsuario.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    usuarios={[
                        {
                            id: '10',
                            name: 'João Silva',
                            email: 'joao@teste.com',
                            role: 'ADMINISTRATIVO'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        await usuario.click(screen.getByTitle('Excluir usuário'));
        await usuario.click(screen.getAllByRole('button', { name: /^excluir$/i })[1]);

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível excluir o usuário.'
        );
    });

    it('deve exibir badge plural e papel padrao sem role', () => {
        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    usuarios={[
                        { id: '1', name: 'A', email: 'a@teste.com' },
                        { id: '2', name: 'B', email: 'b@teste.com' }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('2 usuários')).toBeInTheDocument();
        expect(screen.getAllByText('—')).toHaveLength(2);
    });

    it('deve ignorar confirmacao sem usuario selecionado', () => {
        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    usuarios={[
                        {
                            id: '10',
                            name: 'João Silva',
                            email: 'joao@teste.com',
                            role: 'ADMINISTRATIVO'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        confirmarExclusaoCapturada.current();

        expect(excluirUsuario).not.toHaveBeenCalled();
    });

    it('deve confirmar exclusao sem callback opcional', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    usuarios={[
                        {
                            id: '10',
                            name: 'João Silva',
                            email: 'joao@teste.com',
                            role: 'ADMINISTRATIVO'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        await usuario.click(screen.getByTitle('Excluir usuário'));
        await usuario.click(screen.getAllByRole('button', { name: /^excluir$/i })[1]);

        await waitFor(() => {
            expect(excluirUsuario).toHaveBeenCalledWith('10', 'token');
        });
    });

    it('deve usar inicial padrao sem nome nem email', () => {
        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    usuarios={[
                        {
                            id: '15',
                            role: 'COLABORADOR'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('deve usar email quando nome estiver vazio', () => {
        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    usuarios={[
                        {
                            id: '14',
                            name: '',
                            email: 'z@teste.com'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('z@teste.com')).toBeInTheDocument();
        expect(screen.getByText('Z')).toBeInTheDocument();
    });

    it('deve exibir papel padrao quando role estiver ausente', () => {
        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    usuarios={[
                        {
                            id: '13',
                            name: 'Sem Papel',
                            email: 'sem@teste.com'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('deve limpar mensagem de erro', async () => {
        const usuario = userEvent.setup();
        excluirUsuario.mockRejectedValue(new Error('Erro ao excluir.'));

        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    usuarios={[
                        {
                            id: '10',
                            name: 'João Silva',
                            email: 'joao@teste.com',
                            role: 'ADMINISTRATIVO'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        await usuario.click(screen.getByTitle('Excluir usuário'));
        await usuario.click(screen.getAllByRole('button', { name: /^excluir$/i })[1]);

        expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao excluir.');
        await usuario.click(screen.getByRole('button', { name: 'limpar-erro' }));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    it('deve cancelar dialogo de exclusao', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    usuarios={[
                        {
                            id: '10',
                            name: 'João Silva',
                            email: 'joao@teste.com',
                            role: 'ADMINISTRATIVO'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        await usuario.click(screen.getByTitle('Excluir usuário'));
        await usuario.click(screen.getByRole('button', { name: /cancelar/i }));

        expect(excluirUsuario).not.toHaveBeenCalled();
    });
});
