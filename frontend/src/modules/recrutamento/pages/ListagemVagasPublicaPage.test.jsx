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

    it('deve filtrar vagas pelo tipo de vaga e pelo local de trabalho', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListagemVagasPublicaPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Desenvolvedor')).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/tipo de vaga/i), 'REMOTO');

        expect(screen.getByText('Desenvolvedor')).toBeInTheDocument();
        expect(screen.queryByText('Analista RH')).not.toBeInTheDocument();

        await usuario.selectOptions(screen.getByLabelText(/tipo de vaga/i), '');
        await usuario.selectOptions(screen.getByLabelText(/local de trabalho/i), 'São Paulo');

        expect(screen.getByText('Analista RH')).toBeInTheDocument();
        expect(screen.queryByText('Desenvolvedor')).not.toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar carregamento das vagas', async () => {
        listarVagasPublicas.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <ListagemVagasPublicaPage />
            </MemoryRouter>
        );

        expect(
            await screen.findByText(/não foi possível carregar as vagas/i)
        ).toBeInTheDocument();
    });

    it('deve exibir erro customizado ao falhar carregamento das vagas', async () => {
        listarVagasPublicas.mockRejectedValue(new Error('Serviço indisponível'));

        render(
            <MemoryRouter>
                <ListagemVagasPublicaPage />
            </MemoryRouter>
        );

        expect(await screen.findByText('Serviço indisponível')).toBeInTheDocument();
    });

    it('deve limpar filtros e exibir mensagem quando nenhuma vaga corresponder', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListagemVagasPublicaPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Analista RH')).toBeInTheDocument();
        });

        await usuario.type(screen.getByPlaceholderText(/título da vaga/i), 'Inexistente');

        expect(
            await screen.findByText(/nenhuma vaga encontrada com os filtros selecionados/i)
        ).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /limpar filtros/i }));

        expect(screen.getByPlaceholderText(/título da vaga/i)).toHaveValue('');
        expect(await screen.findByText('Analista RH')).toBeInTheDocument();
    });
});
