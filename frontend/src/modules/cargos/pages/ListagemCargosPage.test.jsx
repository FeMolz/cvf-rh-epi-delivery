import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import * as MensagemFeedback from '../../../shared/components/MensagemFeedback.jsx';
import { ListagemCargosPage } from './ListagemCargosPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/cargosApi.js', () => ({
    listarCargos: vi.fn(),
    baixarRelatorioCargos: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarCargos, baixarRelatorioCargos } = await import('../services/cargosApi.js');

function criarCargos(quantidade, prefixo = 'Cargo') {
    return Array.from({ length: quantidade }, (_, indice) => ({
        id: String(indice + 1),
        name: `${prefixo} ${indice + 1}`,
        description: `Desc ${indice + 1}`,
        createdAt: '2024-01-10T10:00:00.000Z',
        deletedAt: prefixo === 'Inativo' ? '2024-06-01T00:00:00.000Z' : null,
        _count: { roleEpis: 1, employees: 0 }
    }));
}

describe('ListagemCargosPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        listarCargos.mockReset();
        baixarRelatorioCargos.mockReset();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarCargos.mockResolvedValue([
            {
                id: '1',
                name: 'Operador',
                description: 'Linha 1',
                createdAt: '2024-01-10T10:00:00.000Z',
                _count: { roleEpis: 4, employees: 0 }
            }
        ]);
    });

    it('deve exibir cargos ativos', async () => {
        render(
            <MemoryRouter>
                <ListagemCargosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Operador')).toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: /^cargos$/i })).toBeInTheDocument();
        expect(screen.getByText('Linha 1')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /download relatório/i })).toBeInTheDocument();
    });

    it('deve exibir erro, trocar aba, pesquisar e paginar', async () => {
        const usuario = userEvent.setup();
        listarCargos.mockResolvedValueOnce(criarCargos(12));

        render(
            <MemoryRouter>
                <ListagemCargosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Cargo 1')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        expect(screen.getByText('Cargo 11')).toBeInTheDocument();

        await usuario.type(screen.getByPlaceholderText(/buscar por nome/i), 'Cargo 2');
        expect(screen.getByText('Cargo 2')).toBeInTheDocument();

        listarCargos.mockResolvedValueOnce(criarCargos(1, 'Inativo'));
        await usuario.click(screen.getByRole('button', { name: /inativos/i }));

        await waitFor(() => {
            expect(screen.getByText('Inativo 1')).toBeInTheDocument();
        });
    });

    it('deve baixar relatorio e exibir erro de carregamento', async () => {
        const usuario = userEvent.setup();
        listarCargos.mockRejectedValueOnce(new Error('Falha ao carregar'));
        baixarRelatorioCargos.mockResolvedValue(undefined);

        render(
            <MemoryRouter>
                <ListagemCargosPage />
            </MemoryRouter>
        );

        expect(await screen.findByText('Falha ao carregar')).toBeInTheDocument();

        listarCargos.mockResolvedValueOnce(criarCargos(1));
        await usuario.click(screen.getByRole('button', { name: 'Ativos' }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /download relatório/i })).toBeEnabled();
        });

        await usuario.click(screen.getByRole('button', { name: /download relatório/i }));
        expect(baixarRelatorioCargos).toHaveBeenCalledWith('jwt', {});
    });

    it('deve exibir carregamento inicial', async () => {
        listarCargos.mockImplementationOnce(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <ListagemCargosPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/carregando cargos/i)).toBeInTheDocument();
    });

    it('deve paginar para tras na listagem', async () => {
        const usuario = userEvent.setup();
        listarCargos.mockResolvedValue(criarCargos(12));

        render(
            <MemoryRouter>
                <ListagemCargosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Cargo 1')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        await usuario.click(screen.getByRole('button', { name: /anterior/i }));

        expect(screen.getByText('Cargo 1')).toBeInTheDocument();
    });

    it('deve baixar relatorio da aba inativos e exibir erro de download', async () => {
        const usuario = userEvent.setup();
        listarCargos
            .mockResolvedValueOnce(criarCargos(1))
            .mockResolvedValueOnce(criarCargos(1, 'Inativo'));
        baixarRelatorioCargos.mockRejectedValue(new Error('Falha no download.'));

        render(
            <MemoryRouter>
                <ListagemCargosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Cargo 1')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /inativos/i }));

        await waitFor(() => {
            expect(screen.getByText('Inativo 1')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /download relatório/i }));

        expect(await screen.findByText('Falha no download.')).toBeInTheDocument();
        expect(baixarRelatorioCargos).toHaveBeenCalledWith('jwt', { apenasInativos: true });
    });

    it('deve usar mensagem padrao quando erro nao tiver message', async () => {
        listarCargos.mockRejectedValue({});

        render(
            <MemoryRouter>
                <ListagemCargosPage />
            </MemoryRouter>
        );

        expect(await screen.findByText(/não foi possível carregar os cargos/i)).toBeInTheDocument();
    });

    it('deve exibir erro padrao ao falhar download', async () => {
        const usuario = userEvent.setup();
        listarCargos.mockResolvedValue(criarCargos(1));
        baixarRelatorioCargos.mockRejectedValue({});

        render(
            <MemoryRouter>
                <ListagemCargosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /download relatório/i })).toBeEnabled();
        });

        await usuario.click(screen.getByRole('button', { name: /download relatório/i }));

        expect(await screen.findByText(/não foi possível baixar o relatório/i)).toBeInTheDocument();
    });

    it('deve limpar erro via callback do feedback', async () => {
        const original = MensagemFeedback.AreaMensagensFeedback;
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.erro && props.onLimparErro) {
                props.onLimparErro();
            }

            return original(props);
        });

        listarCargos.mockRejectedValue(new Error('Falha ao carregar'));

        render(
            <MemoryRouter>
                <ListagemCargosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });

    it('deve exibir rotulo baixando durante download', async () => {
        const usuario = userEvent.setup();
        let resolver;
        listarCargos.mockResolvedValue(criarCargos(1));
        baixarRelatorioCargos.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        );

        render(
            <MemoryRouter>
                <ListagemCargosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /download relatório/i })).toBeEnabled();
        });

        await usuario.click(screen.getByRole('button', { name: /download relatório/i }));

        expect(screen.getByRole('button', { name: /baixando/i })).toBeDisabled();

        resolver();
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /download relatório/i })).toBeEnabled();
        });
    });
});
