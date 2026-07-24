import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { ListagemVagasAdminPage } from './ListagemVagasAdminPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/recrutamentoApi.js', () => ({
    listarVagasAdmin: vi.fn(),
    listarTodasCandidaturas: vi.fn(),
    listarCadastrosContratacao: vi.fn(),
    atualizarStatusVaga: vi.fn(),
    atualizarStatusCandidatura: vi.fn(),
    reativarCandidatura: vi.fn(),
    gerarConviteCadastro: vi.fn(),
    baixarCurriculo: vi.fn(),
    reenviarEmailConviteCadastro: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const {
    listarVagasAdmin,
    listarTodasCandidaturas,
    listarCadastrosContratacao,
    atualizarStatusVaga,
    reativarCandidatura
} = await import('../services/recrutamentoApi.js');

describe('ListagemVagasAdminPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarVagasAdmin.mockResolvedValue([
            { id: 'v1', tituloVaga: 'Analista', localTrabalho: 'SP', status: 'ATIVA' }
        ]);
        listarTodasCandidaturas.mockResolvedValue({
            totalCandidaturas: 1,
            totalFiltrado: 1,
            candidaturas: [
                {
                    id: 'c1',
                    nomeCompleto: 'Maria',
                    email: 'maria@teste.com',
                    status: 'PENDENTE',
                    createdAt: '2026-01-01T00:00:00.000Z',
                    anuncioVaga: { tituloVaga: 'Analista' }
                }
            ]
        });
        listarCadastrosContratacao.mockResolvedValue([]);
    });

    it('deve exibir aba de vagas por padrao', async () => {
        render(
            <MemoryRouter>
                <ListagemVagasAdminPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Analista')).toBeInTheDocument();
        });

        expect(listarVagasAdmin).toHaveBeenCalledWith('jwt', { status: 'ATIVA' });
        expect(listarTodasCandidaturas).not.toHaveBeenCalled();
        expect(screen.getByRole('link', { name: /página de vagas/i })).toHaveAttribute(
            'href',
            '/publico/vagas'
        );
    });

    it('deve trocar para aba candidaturas e listar todas por padrao', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListagemVagasAdminPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Analista')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /^candidaturas$/i }));

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        expect(listarTodasCandidaturas).toHaveBeenCalledWith('jwt', {
            anuncioVagaId: undefined,
            status: undefined,
            incluirDescartadas: false,
            reativados: false,
            ordenacao: 'RECENTES'
        });
        expect(screen.getByRole('cell', { name: 'Analista' })).toBeInTheDocument();
        expect(screen.getByLabelText(/filtrar por status/i)).toBeInTheDocument();
    });

    it('deve filtrar candidaturas por status selecionado', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListagemVagasAdminPage />
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('button', { name: /^candidaturas$/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/filtrar por status/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/filtrar por status/i), 'PROXIMA_FASE');

        await waitFor(() => {
            expect(listarTodasCandidaturas).toHaveBeenCalledWith('jwt', {
                anuncioVagaId: undefined,
                status: 'PROXIMA_FASE',
                incluirDescartadas: false,
                reativados: false,
                ordenacao: 'RECENTES'
            });
        });
    });

    it('deve ordenar candidaturas pelos mais antigos', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListagemVagasAdminPage />
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('button', { name: /^candidaturas$/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/ordenar por/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/ordenar por/i), 'ANTIGOS');

        await waitFor(() => {
            expect(listarTodasCandidaturas).toHaveBeenCalledWith(
                'jwt',
                expect.objectContaining({
                    ordenacao: 'ANTIGOS'
                })
            );
        });
    });

    it('deve filtrar candidaturas por vaga selecionada', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListagemVagasAdminPage />
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('button', { name: /^candidaturas$/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/filtrar por vaga/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/filtrar por vaga/i), 'v1');

        await waitFor(() => {
            expect(listarTodasCandidaturas).toHaveBeenCalledWith('jwt', {
                anuncioVagaId: 'v1',
                status: undefined,
                incluirDescartadas: false,
                reativados: false,
                ordenacao: 'RECENTES'
            });
        });
    });

    it('deve listar candidaturas descartadas na aba lixeira', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListagemVagasAdminPage />
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('button', { name: /^lixeira$/i }));

        await waitFor(() => {
            expect(listarTodasCandidaturas).toHaveBeenCalledWith('jwt', {
                anuncioVagaId: undefined,
                status: 'DESCARTADO',
                incluirDescartadas: true,
                reativados: false,
                ordenacao: undefined
            });
        });

        expect(screen.getByRole('heading', { name: /^lixeira$/i })).toBeInTheDocument();
    });

    it('deve reativar candidatura descartada na lixeira', async () => {
        const usuario = userEvent.setup();
        listarTodasCandidaturas.mockResolvedValueOnce({
            totalCandidaturas: 1,
            totalFiltrado: 1,
            candidaturas: [
                {
                    id: 'c2',
                    nomeCompleto: 'João',
                    email: 'joao@teste.com',
                    status: 'DESCARTADO',
                    createdAt: '2026-01-01T00:00:00.000Z',
                    curriculoNomeArquivo: 'curriculo.pdf',
                    anuncioVaga: { tituloVaga: 'Analista', status: 'ATIVA' }
                }
            ]
        });
        reativarCandidatura.mockResolvedValue({ destino: 'REATIVADOS' });

        render(
            <MemoryRouter>
                <ListagemVagasAdminPage />
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('button', { name: /^lixeira$/i }));

        await waitFor(() => {
            expect(screen.getByText('João')).toBeInTheDocument();
        });

        expect(screen.queryByRole('button', { name: /^currículo$/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^reativar$/i })).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /^reativar$/i }));

        await waitFor(() => {
            expect(reativarCandidatura).toHaveBeenCalledWith('c2', 'jwt');
        });
    });

    it('deve listar candidatos reativados na aba dedicada', async () => {
        const usuario = userEvent.setup();
        listarTodasCandidaturas.mockResolvedValueOnce({
            totalCandidaturas: 1,
            totalFiltrado: 1,
            candidaturas: [
                {
                    id: 'c3',
                    nomeCompleto: 'Pedro',
                    email: 'pedro@teste.com',
                    status: 'PROXIMA_FASE',
                    createdAt: '2026-01-01T00:00:00.000Z',
                    anuncioVaga: { tituloVaga: 'Vaga encerrada', status: 'ENCERRADA' }
                }
            ]
        });

        render(
            <MemoryRouter>
                <ListagemVagasAdminPage />
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('button', { name: /^reativados$/i }));

        await waitFor(() => {
            expect(listarTodasCandidaturas).toHaveBeenCalledWith('jwt', {
                anuncioVagaId: undefined,
                status: undefined,
                incluirDescartadas: false,
                reativados: true,
                ordenacao: undefined
            });
        });

        expect(screen.getByText('Pedro')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /convite cadastro/i })).toBeInTheDocument();
        expect(screen.queryByLabelText(/filtrar por vaga/i)).not.toBeInTheDocument();
    });

    it('deve publicar vaga em rascunho diretamente na listagem', async () => {
        const usuario = userEvent.setup();
        listarVagasAdmin.mockImplementation((_token, filtros) => {
            if (filtros?.status === 'INATIVA') {
                return Promise.resolve([
                    {
                        id: 'v2',
                        tituloVaga: 'Rascunho RH',
                        localTrabalho: 'SP',
                        modoTrabalho: 'PRESENCIAL',
                        tipoContratacao: 'CLT',
                        status: 'INATIVA'
                    }
                ]);
            }

            return Promise.resolve([
                { id: 'v1', tituloVaga: 'Analista', localTrabalho: 'SP', status: 'ATIVA' }
            ]);
        });
        atualizarStatusVaga.mockResolvedValue({ id: 'v2', status: 'ATIVA' });

        render(
            <MemoryRouter>
                <ListagemVagasAdminPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Analista')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /rascunho/i }));

        await waitFor(() => {
            expect(screen.getByText('Rascunho RH')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /^publicar$/i }));

        await waitFor(() => {
            expect(atualizarStatusVaga).toHaveBeenCalledWith('v2', 'ATIVA', 'jwt');
        });

        expect(screen.getByText(/vaga publicada com sucesso/i)).toBeInTheDocument();
    });

    it('deve encerrar vaga ativa diretamente na listagem', async () => {
        const usuario = userEvent.setup();
        listarVagasAdmin.mockResolvedValue([
            {
                id: 'v1',
                tituloVaga: 'Analista',
                localTrabalho: 'SP',
                modoTrabalho: 'PRESENCIAL',
                tipoContratacao: 'CLT',
                status: 'ATIVA'
            }
        ]);
        atualizarStatusVaga.mockResolvedValue({ id: 'v1', status: 'ENCERRADA' });

        render(
            <MemoryRouter>
                <ListagemVagasAdminPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Analista')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /^encerrar$/i }));

        await waitFor(() => {
            expect(atualizarStatusVaga).toHaveBeenCalledWith('v1', 'ENCERRADA', 'jwt');
        });

        expect(screen.getByText(/vaga encerrada com sucesso/i)).toBeInTheDocument();
    });
});
