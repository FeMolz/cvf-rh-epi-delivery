import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { DetalheCargoPage } from './DetalheCargoPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/cargosApi.js', () => ({
    buscarCargoPorId: vi.fn(),
    atualizarCargo: vi.fn(),
    excluirCargo: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { buscarCargoPorId } = await import('../services/cargosApi.js');

function renderizarPagina(id = 'cargo-1') {
    return render(
        <MemoryRouter initialEntries={[`/admin/cargos/${id}`]}>
            <Routes>
                <Route path="/admin/cargos/:id" element={<DetalheCargoPage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('DetalheCargoPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            token: 'jwt',
            user: { role: 'ADMIN' }
        });
    });

    it('nao deve permitir editar ou excluir cargo inativo', async () => {
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: '2024-06-15T12:00:00.000Z',
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-06-15T12:00:00.000Z',
            _count: { roleEpis: 0 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /operador/i })).toBeInTheDocument();
        });

        expect(
            screen.getByText(/este cargo está inativo e não pode ser editado ou excluído novamente/i)
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/nome do cargo/i)).toBeDisabled();
        expect(screen.queryByRole('button', { name: /salvar alterações/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /excluir cargo/i })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /voltar/i })).toBeInTheDocument();
    });

    it('deve exibir acoes de edicao para cargo ativo', async () => {
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 2 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /excluir cargo/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/nome do cargo/i)).not.toBeDisabled();
    });
});
