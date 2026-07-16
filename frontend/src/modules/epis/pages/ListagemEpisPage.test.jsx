import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { ListagemEpisPage } from './ListagemEpisPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../cargos/services/cargosApi.js', () => ({
    listarCargos: vi.fn()
}));

vi.mock('../services/episApi.js', () => ({
    listarEpis: vi.fn()
}));

vi.mock('../services/rolesEpisApi.js', () => ({
    listarEpisPorCargo: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarCargos } = await import('../../cargos/services/cargosApi.js');
const { listarEpis } = await import('../services/episApi.js');
const { listarEpisPorCargo } = await import('../services/rolesEpisApi.js');

/**
 * @param {string} valorCargo
 */
async function aguardarOpcaoCargoDisponivel(valorCargo) {
    await waitFor(() => {
        const select = screen.getByLabelText(/visualizar epis por cargo/i);
        const opcao = select.querySelector(`option[value="${valorCargo}"]`);

        expect(opcao).toBeInTheDocument();
    });
}

describe('ListagemEpisPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarEpis.mockResolvedValue([
            { id: '1', name: 'Capacete', caNumber: '11070', isActive: true, caExpirationDate: '2027-01-01' }
        ]);
        listarCargos.mockResolvedValue([
            { id: 'cargo-1', name: 'Operador', _count: { roleEpis: 2 } }
        ]);
    });

    it('deve exibir epis em cache', async () => {
        render(
            <MemoryRouter>
                <ListagemEpisPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Capacete')).toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: /^epis$/i })).toBeInTheDocument();
        expect(screen.getByText('11070')).toBeInTheDocument();
    });

    it('deve filtrar, trocar aba e visualizar epis por cargo', async () => {
        const usuario = userEvent.setup();
        listarEpis.mockResolvedValue(
            Array.from({ length: 12 }, (_, indice) => ({
                id: String(indice + 1),
                name: `EPI ${indice + 1}`,
                caNumber: `1107${indice}`,
                isActive: indice !== 11,
                caExpirationDate: '2027-01-01'
            }))
        );
        listarEpisPorCargo.mockResolvedValue([
            {
                id: 'v1',
                epi: { name: 'Capacete Cargo', caNumber: '22070' },
                periodicityDays: 180
            }
        ]);

        render(
            <MemoryRouter>
                <ListagemEpisPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('EPI 1')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /inativos/i }));
        await waitFor(() => {
            expect(screen.getByText('EPI 12')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: 'Ativos' }));
        await waitFor(() => {
            expect(screen.getByText('EPI 1')).toBeInTheDocument();
        });

        await aguardarOpcaoCargoDisponivel('cargo-1');
        await usuario.selectOptions(
            screen.getByLabelText(/visualizar epis por cargo/i),
            'cargo-1'
        );
        await waitFor(() => {
            expect(screen.getByText('Capacete Cargo')).toBeInTheDocument();
        });

        expect(listarEpisPorCargo).toHaveBeenCalledWith('cargo-1', 'jwt');
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        listarEpis.mockRejectedValue(new Error('Erro nos EPIs'));

        render(
            <MemoryRouter>
                <ListagemEpisPage />
            </MemoryRouter>
        );

        expect(await screen.findByText('Erro nos EPIs')).toBeInTheDocument();
    });

    it('deve buscar, paginar e tratar falhas do cargo', async () => {
        const usuario = userEvent.setup();
        listarEpis.mockResolvedValue(
            Array.from({ length: 12 }, (_, indice) => ({
                id: String(indice + 1),
                name: `EPI ${indice + 1}`,
                caNumber: `1107${indice}`,
                isActive: true,
                caExpirationDate: '2027-01-01'
            }))
        );
        listarEpisPorCargo.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <ListagemEpisPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('EPI 1')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        await waitFor(() => {
            expect(screen.getByText('EPI 11')).toBeInTheDocument();
        });

        await aguardarOpcaoCargoDisponivel('cargo-1');
        await usuario.selectOptions(screen.getByLabelText(/visualizar epis por cargo/i), 'cargo-1');

        expect(await screen.findByText(/não foi possível carregar os epis do cargo/i)).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar carregamento', async () => {
        listarEpis.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <ListagemEpisPage />
            </MemoryRouter>
        );

        expect(await screen.findByText(/não foi possível carregar os epis/i)).toBeInTheDocument();
    });

    it('deve pesquisar, paginar anterior e limpar erro', async () => {
        const usuario = userEvent.setup();
        listarEpis.mockResolvedValue(
            Array.from({ length: 12 }, (_, indice) => ({
                id: String(indice + 1),
                name: `EPI ${indice + 1}`,
                caNumber: `1107${indice}`,
                isActive: true,
                caExpirationDate: '2027-01-01'
            }))
        );

        render(
            <MemoryRouter>
                <ListagemEpisPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('EPI 1')).toBeInTheDocument();
        });

        await usuario.type(screen.getByRole('searchbox', { name: /pesquisar epis/i }), 'EPI 2');
        expect(screen.getByText('EPI 2')).toBeInTheDocument();
        expect(screen.queryByText('EPI 1')).not.toBeInTheDocument();

        await usuario.clear(screen.getByRole('searchbox', { name: /pesquisar epis/i }));
        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        await usuario.click(screen.getByRole('button', { name: /anterior/i }));

        expect(screen.getByText('EPI 1')).toBeInTheDocument();
    });

    it('deve limpar mensagem de erro automaticamente', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        listarEpis.mockRejectedValue(new Error('Erro temporário'));

        render(
            <MemoryRouter>
                <ListagemEpisPage />
            </MemoryRouter>
        );

        expect(await screen.findByText('Erro temporário')).toBeInTheDocument();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        expect(screen.queryByText('Erro temporário')).not.toBeInTheDocument();
        vi.useRealTimers();
    });

    it('deve paginar epis por cargo e ignorar cargos sem vinculos', async () => {
        const usuario = userEvent.setup();
        listarCargos.mockResolvedValue([
            { id: 'cargo-1', name: 'Operador', _count: { roleEpis: 2 } },
            { id: 'cargo-vazio', name: 'Sem EPIs', _count: { roleEpis: 0 } }
        ]);
        listarEpisPorCargo.mockResolvedValue(
            Array.from({ length: 12 }, (_, indice) => ({
                id: `v${indice}`,
                epi: { name: `EPI Cargo ${indice + 1}`, caNumber: `2207${indice}` },
                periodicityDays: 180
            }))
        );

        render(
            <MemoryRouter>
                <ListagemEpisPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/visualizar epis por cargo/i)).toBeInTheDocument();
        });

        expect(screen.queryByRole('option', { name: /sem epis/i })).not.toBeInTheDocument();

        await aguardarOpcaoCargoDisponivel('cargo-1');
        await usuario.selectOptions(screen.getByLabelText(/visualizar epis por cargo/i), 'cargo-1');

        await waitFor(() => {
            expect(screen.getByText('EPI Cargo 1')).toBeInTheDocument();
        });

        expect(
            screen.getByPlaceholderText(/buscar por nome, ca ou periodicidade/i)
        ).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));

        await waitFor(() => {
            expect(screen.getByText('EPI Cargo 11')).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/visualizar epis por cargo/i), '');

        await waitFor(() => {
            expect(screen.getByText('Capacete')).toBeInTheDocument();
        });
    });

    it('deve buscar vinculos por cargo, paginar anterior e exibir cargo sem nome', async () => {
        const usuario = userEvent.setup();
        listarCargos.mockResolvedValue([{ id: 'cargo-1', name: '', _count: { roleEpis: 2 } }]);
        listarEpisPorCargo.mockResolvedValue(
            Array.from({ length: 12 }, (_, indice) => ({
                id: `v${indice}`,
                epi: { name: `EPI Cargo ${indice + 1}`, caNumber: `3307${indice}` },
                periodicityDays: 180
            }))
        );

        render(
            <MemoryRouter>
                <ListagemEpisPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/visualizar epis por cargo/i)).toBeInTheDocument();
        });

        await aguardarOpcaoCargoDisponivel('cargo-1');
        await usuario.selectOptions(screen.getByLabelText(/visualizar epis por cargo/i), 'cargo-1');

        await waitFor(() => {
            expect(screen.getByText('EPIs do cargo')).toBeInTheDocument();
        });

        await usuario.type(
            screen.getByPlaceholderText(/buscar por nome, ca ou periodicidade/i),
            'EPI Cargo 2'
        );
        expect(screen.getByText('EPI Cargo 2')).toBeInTheDocument();

        await usuario.clear(screen.getByPlaceholderText(/buscar por nome, ca ou periodicidade/i));
        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        await usuario.click(screen.getByRole('button', { name: /anterior/i }));

        expect(screen.getByText('EPI Cargo 1')).toBeInTheDocument();
    });

});
