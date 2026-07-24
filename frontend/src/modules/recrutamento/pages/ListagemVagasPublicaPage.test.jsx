import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { ListagemVagasPublicaPage } from './ListagemVagasPublicaPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn(() => ({ user: null, logout: vi.fn(), podeCadastrarUsuarios: false }))
}));

vi.mock('../services/recrutamentoApi.js', () => ({
    listarVagasPublicas: vi.fn()
}));

const { listarVagasPublicas } = await import('../services/recrutamentoApi.js');

describe('ListagemVagasPublicaPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        listarVagasPublicas.mockResolvedValue([
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

    it('deve listar vagas publicas e linkar para o detalhe', async () => {
        render(
            <MemoryRouter>
                <ListagemVagasPublicaPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Analista RH')).toBeInTheDocument();
        });

        expect(listarVagasPublicas).toHaveBeenCalled();
        expect(screen.getAllByRole('link', { name: /ver vaga/i })[0]).toHaveAttribute(
            'href',
            '/publico/vagas/v1'
        );
        expect(screen.getByLabelText(/tipo de vaga/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/modelo de contratação/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/local de trabalho/i)).toBeInTheDocument();
    });

    it('deve filtrar vagas pelo modelo de contratacao', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListagemVagasPublicaPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Desenvolvedor')).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/modelo de contratação/i), 'PJ');

        expect(screen.getByText('Desenvolvedor')).toBeInTheDocument();
        expect(screen.queryByText('Analista RH')).not.toBeInTheDocument();
    });
});
