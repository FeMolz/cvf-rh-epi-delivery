import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { DashboardAdminPage } from './DashboardAdminPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../usuarios/services/usuariosApi.js', () => ({
    listarUsuarios: vi.fn()
}));

vi.mock('../../cargos/services/cargosApi.js', () => ({
    listarCargos: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarUsuarios } = await import('../../usuarios/services/usuariosApi.js');
const { listarCargos } = await import('../../cargos/services/cargosApi.js');

describe('DashboardAdminPage', () => {
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

    it('deve exibir painel de usuarios por padrao', async () => {
        render(
            <MemoryRouter>
                <DashboardAdminPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: /^dashboard$/i })).toBeInTheDocument();
    });

    it('deve trocar para painel de cargos', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <DashboardAdminPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: 'Cargos' }));

        await waitFor(() => {
            expect(screen.getByText('Operador')).toBeInTheDocument();
        });
    });

    it('deve pesquisar cargos e limpar termo ao trocar aba', async () => {
        const usuario = userEvent.setup();
        listarCargos.mockResolvedValue([
            {
                id: '1',
                name: 'Operador',
                description: 'Linha 1',
                createdAt: '2024-01-10T10:00:00.000Z',
                _count: { roleEpis: 2 }
            },
            {
                id: '2',
                name: 'Auxiliar',
                description: 'Apoio',
                createdAt: '2024-01-10T10:00:00.000Z',
                _count: { roleEpis: 0 }
            }
        ]);

        render(
            <MemoryRouter>
                <DashboardAdminPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: 'Cargos' }));

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/buscar por nome, descrição ou status/i)).toBeInTheDocument();
        });

        await usuario.type(
            screen.getByPlaceholderText(/buscar por nome, descrição ou status/i),
            'Auxiliar'
        );

        expect(screen.getByText('Auxiliar')).toBeInTheDocument();
        expect(screen.queryByText('Operador')).not.toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: 'Usuários' }));

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/buscar por nome, e-mail ou permissão/i)).toHaveValue('');
        });
    });
});
