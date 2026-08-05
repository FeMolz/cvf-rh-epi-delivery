import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { PainelListagemEmpresas } from './PainelListagemEmpresas.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/empresasApi.js', () => ({
    listarEmpresas: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarEmpresas } = await import('../services/empresasApi.js');

function criarEmpresas(quantidade, ativas = true) {
    return Array.from({ length: quantidade }, (_, indice) => ({
        id: String(indice + 1),
        name: `Empresa ${indice + 1}`,
        cnpj: `12.345.678/000${String(indice + 1).padStart(2, '0')}-99`,
        isActive: ativas
    }));
}

describe('PainelListagemEmpresas', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarEmpresas.mockResolvedValue(criarEmpresas(1));
    });

    it('deve listar empresas ativas', async () => {
        render(
            <MemoryRouter>
                <PainelListagemEmpresas />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Empresa 1')).toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: 'Empresas ativas' })).toBeInTheDocument();
    });

    it('deve paginar, pesquisar e trocar aba', async () => {
        const usuario = userEvent.setup();
        listarEmpresas.mockResolvedValue([...criarEmpresas(12), ...criarEmpresas(1, false)]);

        render(
            <MemoryRouter>
                <PainelListagemEmpresas />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Empresa 1')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        expect(screen.getByText('Empresa 11')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /anterior/i }));
        expect(screen.getByText('Empresa 1')).toBeInTheDocument();

        await usuario.type(screen.getByPlaceholderText(/buscar por nome ou cnpj/i), 'Empresa 2');
        expect(screen.getByText('Empresa 2')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /inativas/i }));

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Empresas inativas' })).toBeInTheDocument();
            expect(screen.getByText('Empresa 1')).toBeInTheDocument();
        });
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        listarEmpresas.mockRejectedValue(new Error('Falha ao carregar'));

        render(
            <MemoryRouter>
                <PainelListagemEmpresas />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao carregar');
    });

    it('deve exibir erro generico sem mensagem', async () => {
        listarEmpresas.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <PainelListagemEmpresas />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar as empresas.');
    });

    it('deve limpar mensagem de erro automaticamente', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        listarEmpresas.mockRejectedValue(new Error('Falha ao carregar'));

        render(
            <MemoryRouter>
                <PainelListagemEmpresas />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao carregar');

        await act(async () => {
            await vi.advanceTimersByTimeAsync(5000);
        });

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        vi.useRealTimers();
    });
});
