import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { DetalheCargoPage } from './DetalheCargoPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/cargosApi.js', () => ({
    buscarCargoPorId: vi.fn(),
    atualizarCargo: vi.fn(),
    alterarSituacaoCargo: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { buscarCargoPorId, alterarSituacaoCargo } = await import('../services/cargosApi.js');

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
            user: { role: 'ADMINISTRATIVO' }
        });
    });

    it('nao deve permitir editar cargo inativo, mas deve permitir reativar', async () => {
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: '2024-06-15T12:00:00.000Z',
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-06-15T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /operador/i })).toBeInTheDocument();
        });

        expect(screen.getByText(/este cargo está inativo e não pode ser editado/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/nome do cargo/i)).toBeDisabled();
        expect(screen.queryByRole('button', { name: /salvar alterações/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reativar cargo/i })).toBeInTheDocument();
    });

    it('deve exibir acoes de edicao e desativacao para cargo ativo sem funcionarios', async () => {
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 2, employees: 0 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /desativar cargo/i })).toBeEnabled();
        expect(screen.getByLabelText(/nome do cargo/i)).not.toBeDisabled();
    });

    it('deve desabilitar desativacao quando cargo ativo possui funcionarios vinculados', async () => {
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 2 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /desativar cargo/i })).toBeDisabled();
        });

        expect(
            screen.getByText(/altere o cargo de cada funcionário antes de desativá-lo/i)
        ).toBeInTheDocument();
    });

    it('deve exibir aviso quando desativacao for bloqueada por funcionarios vinculados', async () => {
        const usuario = userEvent.setup();

        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        const erroBloqueio = new Error(
            'Não é possível desativar este cargo enquanto houver funcionários cadastrados nele. Altere o cargo dos funcionários antes de continuar.'
        );
        erroBloqueio.statusCode = 409;
        alterarSituacaoCargo.mockRejectedValue(erroBloqueio);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /desativar cargo/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /desativar cargo/i }));
        await usuario.click(screen.getAllByRole('button', { name: /desativar cargo/i })[1]);

        expect(
            await screen.findByText(
                /não é possível desativar este cargo enquanto houver funcionários cadastrados nele/i
            )
        ).toHaveClass('mensagem--aviso');
    });
});
