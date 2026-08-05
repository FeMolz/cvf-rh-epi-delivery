import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { PainelListagemSetores } from './PainelListagemSetores.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/setoresApi.js', () => ({
    listarSetores: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarSetores } = await import('../services/setoresApi.js');

function criarSetores(quantidade, ativos = true) {
    return Array.from({ length: quantidade }, (_, indice) => ({
        id: String(indice + 1),
        nome: `Setor ${indice + 1}`,
        isActive: ativos
    }));
}

describe('PainelListagemSetores', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarSetores.mockResolvedValue(criarSetores(1));
    });

    it('deve listar setores ativos', async () => {
        render(
            <MemoryRouter>
                <PainelListagemSetores />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Setor 1')).toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: 'Setores ativos' })).toBeInTheDocument();
    });

    it('deve paginar, pesquisar e trocar aba', async () => {
        const usuario = userEvent.setup();
        listarSetores.mockResolvedValue([...criarSetores(12), ...criarSetores(1, false)]);

        render(
            <MemoryRouter>
                <PainelListagemSetores />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Setor 1')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        expect(screen.getByText('Setor 11')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /anterior/i }));
        expect(screen.getByText('Setor 1')).toBeInTheDocument();

        await usuario.type(screen.getByPlaceholderText(/buscar por nome/i), 'Setor 2');
        expect(screen.getByText('Setor 2')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /inativos/i }));

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Setores inativos' })).toBeInTheDocument();
            expect(screen.getByText('Setor 1')).toBeInTheDocument();
        });
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        listarSetores.mockRejectedValue(new Error('Falha ao carregar'));

        render(
            <MemoryRouter>
                <PainelListagemSetores />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao carregar');
    });

    it('deve exibir erro generico sem mensagem', async () => {
        listarSetores.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <PainelListagemSetores />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os setores.');
    });

    it('deve limpar mensagem de erro automaticamente', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        listarSetores.mockRejectedValue(new Error('Falha ao carregar'));

        render(
            <MemoryRouter>
                <PainelListagemSetores />
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
