import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { ListagemSetoresPage } from './ListagemSetoresPage.jsx';

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

vi.mock('../services/setoresApi.js', () => ({
    listarSetores: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarSetores } = await import('../services/setoresApi.js');

function criarSetores(quantidade, prefixo = 'Setor', ativos = true) {
    return Array.from({ length: quantidade }, (_, indice) => ({
        id: String(indice + 1),
        nome: `${prefixo} ${indice + 1}`,
        isActive: ativos
    }));
}

describe('ListagemSetoresPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarSetores.mockResolvedValue([
            {
                id: '1',
                nome: 'ADMINISTRATIVO',
                isActive: true
            }
        ]);
    });

    it('deve exibir setores ativos', async () => {
        render(
            <MemoryRouter>
                <ListagemSetoresPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('ADMINISTRATIVO')).toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: /^setores$/i })).toBeInTheDocument();
        expect(screen.getByText('Ativo')).toBeInTheDocument();
    });

    it('deve paginar, pesquisar e trocar aba', async () => {
        const usuario = userEvent.setup();
        listarSetores.mockResolvedValue([
            ...criarSetores(12),
            ...criarSetores(1, 'Inativo', false)
        ]);

        render(
            <MemoryRouter>
                <ListagemSetoresPage />
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
            expect(screen.getByText('Inativo 1')).toBeInTheDocument();
            expect(screen.getByText('Setores inativos')).toBeInTheDocument();
        });
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        listarSetores.mockRejectedValue(new Error('Falha ao carregar'));

        render(
            <MemoryRouter>
                <ListagemSetoresPage />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao carregar');
    });

    it('deve exibir erro generico sem mensagem', async () => {
        listarSetores.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <ListagemSetoresPage />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível carregar os setores.'
        );
    });

    it('deve limpar mensagem de erro', async () => {
        const usuario = userEvent.setup();
        listarSetores.mockRejectedValue(new Error('Falha ao carregar'));

        render(
            <MemoryRouter>
                <ListagemSetoresPage />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao carregar');
        await usuario.click(screen.getByRole('button', { name: 'limpar-erro' }));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });
});
