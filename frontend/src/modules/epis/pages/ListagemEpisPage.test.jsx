import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
});
