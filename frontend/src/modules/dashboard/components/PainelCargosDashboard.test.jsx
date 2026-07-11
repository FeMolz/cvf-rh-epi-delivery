import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { PainelCargosDashboard } from './PainelCargosDashboard.jsx';

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

vi.mock('../../cargos/services/cargosApi.js', () => ({
    listarCargos: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarCargos } = await import('../../cargos/services/cargosApi.js');

function criarCargos(quantidade) {
    return Array.from({ length: quantidade }, (_, indice) => ({
        id: String(indice + 1),
        name: `Cargo ${indice + 1}`,
        description: `Desc ${indice + 1}`,
        createdAt: '2024-01-10T10:00:00.000Z',
        _count: { roleEpis: 2 }
    }));
}

describe('PainelCargosDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarCargos.mockResolvedValue([
            {
                id: '1',
                name: 'Operador',
                description: 'Linha 1',
                createdAt: '2024-01-10T10:00:00.000Z',
                _count: { roleEpis: 2 }
            }
        ]);
    });

    it('deve exibir cargos carregados', async () => {
        render(
            <MemoryRouter>
                <PainelCargosDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Operador')).toBeInTheDocument();
        });

        expect(screen.getByText('Cargos')).toBeInTheDocument();
        expect(screen.getByText('Ativo')).toBeInTheDocument();
    });

    it('deve filtrar por termo de busca e paginar', async () => {
        const usuario = userEvent.setup();
        listarCargos.mockResolvedValue(criarCargos(12));

        render(
            <MemoryRouter>
                <PainelCargosDashboard termoBusca="" />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Cargo 1')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        expect(screen.getByText('Cargo 11')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /anterior/i }));
        expect(screen.getByText('Cargo 1')).toBeInTheDocument();
    });

    it('deve aplicar filtro externo de busca', async () => {
        listarCargos.mockResolvedValue(criarCargos(3));

        const { rerender } = render(
            <MemoryRouter>
                <PainelCargosDashboard termoBusca="" />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Cargo 1')).toBeInTheDocument();
        });

        rerender(
            <MemoryRouter>
                <PainelCargosDashboard termoBusca="Cargo 2" />
            </MemoryRouter>
        );

        expect(screen.getByText('Cargo 2')).toBeInTheDocument();
        expect(screen.queryByText('Cargo 1')).not.toBeInTheDocument();
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        listarCargos.mockRejectedValue(new Error('Erro ao carregar'));

        render(
            <MemoryRouter>
                <PainelCargosDashboard />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao carregar');
    });

    it('deve exibir erro generico sem mensagem', async () => {
        listarCargos.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <PainelCargosDashboard />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível carregar os cargos.'
        );
    });

    it('deve exibir cargo inativo na listagem', async () => {
        listarCargos.mockResolvedValue([
            {
                id: '2',
                name: 'Cargo Inativo',
                description: 'Desativado',
                createdAt: '2024-01-10T10:00:00.000Z',
                deletedAt: '2024-01-11T10:00:00.000Z',
                _count: { roleEpis: 0 }
            }
        ]);

        render(
            <MemoryRouter>
                <PainelCargosDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Cargo Inativo')).toBeInTheDocument();
            expect(screen.getByText('Inativo')).toBeInTheDocument();
        });
    });

    it('deve ignorar atualizacao apos desmontar', async () => {
        listarCargos.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve(criarCargos(1)), 50);
                })
        );

        const { unmount } = render(
            <MemoryRouter>
                <PainelCargosDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(listarCargos).toHaveBeenCalled();
        });

        unmount();

        await new Promise((resolve) => {
            setTimeout(resolve, 60);
        });
    });

    it('deve ignorar erro apos desmontar', async () => {
        let rejeitarCarregamento = () => {};

        listarCargos.mockImplementation(
            () =>
                new Promise((_, reject) => {
                    rejeitarCarregamento = () => reject(new Error('Erro ao carregar'));
                })
        );

        const { unmount } = render(
            <MemoryRouter>
                <PainelCargosDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(listarCargos).toHaveBeenCalled();
        });

        unmount();
        rejeitarCarregamento();

        await new Promise((resolve) => {
            setTimeout(resolve, 60);
        });
    });

    it('deve limpar mensagem de erro', async () => {
        const usuario = userEvent.setup();
        listarCargos.mockRejectedValue(new Error('Erro ao carregar'));

        render(
            <MemoryRouter>
                <PainelCargosDashboard />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao carregar');
        await usuario.click(screen.getByRole('button', { name: 'limpar-erro' }));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });
});
