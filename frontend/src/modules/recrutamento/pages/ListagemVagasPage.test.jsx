import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { ListagemVagasPage } from './ListagemVagasPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn(() => ({ token: 'jwt', user: { name: 'Ana' }, logout: vi.fn() }))
}));

vi.mock('../services/recrutamentoApi.js', () => ({
    listarVagasAtivas: vi.fn()
}));

const { listarVagasAtivas } = await import('../services/recrutamentoApi.js');

describe('ListagemVagasPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        listarVagasAtivas.mockResolvedValue([
            {
                id: 'v1',
                tituloVaga: 'Analista RH',
                localTrabalho: 'São Paulo',
                modoTrabalho: 'PRESENCIAL',
                tipoContratacao: 'CLT'
            },
            {
                id: 'v2',
                tituloVaga: 'Desenvolvedor',
                localTrabalho: 'Remoto',
                modoTrabalho: 'REMOTO',
                tipoContratacao: 'PJ'
            }
        ]);
    });

    it('deve listar vagas ativas e filtrar por termo', async () => {
        const usuario = userEvent.setup({ delay: null });

        render(
            <MemoryRouter>
                <ListagemVagasPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Analista RH')).toBeInTheDocument();
        });

        expect(screen.getAllByRole('link', { name: /ver detalhes/i })[0]).toHaveAttribute(
            'href',
            '/vagas/v1'
        );

        await usuario.type(screen.getByPlaceholderText(/buscar por título ou local/i), 'Remoto');

        expect(screen.getByText('Desenvolvedor')).toBeInTheDocument();
        expect(screen.queryByText('Analista RH')).not.toBeInTheDocument();
    });

    it('deve exibir erro quando a api falhar', async () => {
        listarVagasAtivas.mockRejectedValue(new Error('Falha ao carregar'));

        render(
            <MemoryRouter>
                <ListagemVagasPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/falha ao carregar/i)).toBeInTheDocument();
        });
    });

    it('deve exibir erro generico quando a api falhar sem mensagem', async () => {
        listarVagasAtivas.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <ListagemVagasPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/não foi possível carregar as vagas/i)).toBeInTheDocument();
        });
    });

    it('deve exibir mensagem quando nao houver vagas', async () => {
        listarVagasAtivas.mockResolvedValue([]);

        render(
            <MemoryRouter>
                <ListagemVagasPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/nenhuma vaga ativa no momento/i)).toBeInTheDocument();
        });
    });
});
