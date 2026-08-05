import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { PainelListagemCargos } from './PainelListagemCargos.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/cargosApi.js', () => ({
    listarCargos: vi.fn(),
    baixarRelatorioCargos: vi.fn()
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

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarCargos, baixarRelatorioCargos } = await import('../services/cargosApi.js');

function criarCargos(quantidade, ativos = true) {
    return Array.from({ length: quantidade }, (_, indice) => ({
        id: String(indice + 1),
        name: `Cargo ${indice + 1}`,
        description: `Descrição ${indice + 1}`,
        deletedAt: ativos ? null : new Date().toISOString(),
        createdAt: '2026-01-01T00:00:00.000Z',
        _count: { roleEpis: 0 }
    }));
}

describe('PainelListagemCargos', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarCargos.mockResolvedValue(criarCargos(1));
        baixarRelatorioCargos.mockResolvedValue(undefined);
    });

    it('deve listar cargos ativos', async () => {
        render(
            <MemoryRouter>
                <PainelListagemCargos />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Cargo 1')).toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: 'Cargos ativos' })).toBeInTheDocument();
    });

    it('deve paginar, pesquisar, trocar aba e baixar relatório', async () => {
        const usuario = userEvent.setup();
        listarCargos.mockResolvedValue(criarCargos(12));

        render(
            <MemoryRouter>
                <PainelListagemCargos />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Cargo 1')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        expect(screen.getByText('Cargo 11')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /anterior/i }));
        expect(screen.getByText('Cargo 1')).toBeInTheDocument();

        await usuario.type(screen.getByPlaceholderText(/buscar por nome ou descrição/i), 'Cargo 2');
        expect(screen.getByText('Cargo 2')).toBeInTheDocument();

        listarCargos.mockResolvedValue(criarCargos(1, false));
        await usuario.click(screen.getByRole('button', { name: /inativos/i }));

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Cargos inativos' })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /download relatório/i }));

        await waitFor(() => {
            expect(baixarRelatorioCargos).toHaveBeenCalledWith('jwt', { apenasInativos: true });
        });
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        listarCargos.mockRejectedValue(new Error('Falha ao carregar'));

        render(
            <MemoryRouter>
                <PainelListagemCargos />
            </MemoryRouter>
        );

        const alerta = await screen.findByRole('alert');
        expect(alerta).toHaveTextContent('Falha ao carregar');
    });

    it('deve exibir erro generico ao falhar carregamento', async () => {
        listarCargos.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <PainelListagemCargos />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os cargos.');
    });

    it('deve exibir erro ao falhar download', async () => {
        const usuario = userEvent.setup();
        baixarRelatorioCargos.mockRejectedValue(new Error('Falha download'));

        render(
            <MemoryRouter>
                <PainelListagemCargos />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Cargo 1')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /download relatório/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha download');
    });

    it('deve exibir erro generico ao falhar download', async () => {
        const usuario = userEvent.setup();
        baixarRelatorioCargos.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <PainelListagemCargos />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Cargo 1')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /download relatório/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível baixar o relatório.');
    });

    it('deve limpar mensagem de erro manualmente', async () => {
        const usuario = userEvent.setup();
        listarCargos.mockRejectedValue(new Error('Falha ao carregar'));

        render(
            <MemoryRouter>
                <PainelListagemCargos />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao carregar');

        await usuario.click(screen.getByRole('button', { name: 'limpar-erro' }));

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
