import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { PainelUsuariosDashboard } from './PainelUsuariosDashboard.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
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

vi.mock('../../usuarios/services/usuariosApi.js', () => ({
    listarUsuarios: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarUsuarios } = await import('../../usuarios/services/usuariosApi.js');

function criarUsuarios(quantidade) {
    return Array.from({ length: quantidade }, (_, indice) => ({
        id: String(indice + 1),
        name: `Usuario ${indice + 1}`,
        email: `usuario${indice + 1}@teste.com`,
        role: 'ADMIN',
        isActive: true
    }));
}

describe('PainelUsuariosDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarUsuarios.mockResolvedValue([
            {
                id: '1',
                name: 'Ana',
                email: 'ana@b.com',
                role: 'ADMIN',
                isActive: true
            }
        ]);
    });

    it('deve exibir usuarios carregados', async () => {
        render(
            <MemoryRouter>
                <PainelUsuariosDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        expect(screen.getByText('Usuários')).toBeInTheDocument();
        expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('deve filtrar por termo de busca e paginar', async () => {
        const usuario = userEvent.setup();
        listarUsuarios.mockResolvedValue(criarUsuarios(12));

        render(
            <MemoryRouter>
                <PainelUsuariosDashboard termoBusca="" />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Usuario 1')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        expect(screen.getByText('Usuario 11')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /anterior/i }));
        expect(screen.getByText('Usuario 1')).toBeInTheDocument();
    });

    it('deve aplicar filtro externo de busca', async () => {
        listarUsuarios.mockResolvedValue(criarUsuarios(3));

        const { rerender } = render(
            <MemoryRouter>
                <PainelUsuariosDashboard termoBusca="" />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Usuario 1')).toBeInTheDocument();
        });

        rerender(
            <MemoryRouter>
                <PainelUsuariosDashboard termoBusca="Usuario 2" />
            </MemoryRouter>
        );

        expect(screen.getByText('Usuario 2')).toBeInTheDocument();
        expect(screen.queryByText('Usuario 1')).not.toBeInTheDocument();
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        listarUsuarios.mockRejectedValue(new Error('Erro ao carregar'));

        render(
            <MemoryRouter>
                <PainelUsuariosDashboard />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao carregar');
    });

    it('deve exibir erro generico sem mensagem', async () => {
        listarUsuarios.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <PainelUsuariosDashboard />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível carregar os usuários.'
        );
    });

    it('deve exibir usuario offline na listagem', async () => {
        listarUsuarios.mockResolvedValue([
            {
                id: '2',
                name: 'Bruno',
                email: 'bruno@b.com',
                role: 'COLABORADOR',
                isActive: false,
                lastLogin: '2024-01-10T10:00:00.000Z'
            }
        ]);

        render(
            <MemoryRouter>
                <PainelUsuariosDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Bruno')).toBeInTheDocument();
            expect(screen.getByText(/offline/i)).toBeInTheDocument();
        });
    });

    it('deve ignorar atualizacao apos desmontar', async () => {
        listarUsuarios.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve(criarUsuarios(1)), 50);
                })
        );

        const { unmount } = render(
            <MemoryRouter>
                <PainelUsuariosDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(listarUsuarios).toHaveBeenCalled();
        });

        unmount();

        await new Promise((resolve) => {
            setTimeout(resolve, 60);
        });
    });

    it('deve ignorar erro apos desmontar', async () => {
        let rejeitarCarregamento = () => {};

        listarUsuarios.mockImplementation(
            () =>
                new Promise((_, reject) => {
                    rejeitarCarregamento = () => reject(new Error('Erro ao carregar'));
                })
        );

        const { unmount } = render(
            <MemoryRouter>
                <PainelUsuariosDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(listarUsuarios).toHaveBeenCalled();
        });

        unmount();
        rejeitarCarregamento();

        await new Promise((resolve) => {
            setTimeout(resolve, 60);
        });
    });

    it('deve limpar mensagem de erro', async () => {
        const usuario = userEvent.setup();
        listarUsuarios.mockRejectedValue(new Error('Erro ao carregar'));

        render(
            <MemoryRouter>
                <PainelUsuariosDashboard />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao carregar');
        await usuario.click(screen.getByRole('button', { name: 'limpar-erro' }));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });
});
