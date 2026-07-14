import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import * as MensagemFeedback from '../../../shared/components/MensagemFeedback.jsx';
import { VinculoEpisCargoPage } from './VinculoEpisCargoPage.jsx';


vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../cargos/services/cargosApi.js', () => ({
    listarCargos: vi.fn()
}));

vi.mock('../services/episApi.js', () => ({
    listarEpis: vi.fn()
}));

vi.mock('../services/rolesEpisApi.js', () => ({
    listarEpisPorCargo: vi.fn(),
    vincularEpiAoCargo: vi.fn(),
    desvincularEpiDoCargo: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarCargos } = await import('../../cargos/services/cargosApi.js');
const { listarEpis } = await import('../services/episApi.js');
const {
    listarEpisPorCargo,
    vincularEpiAoCargo,
    desvincularEpiDoCargo
} = await import('../services/rolesEpisApi.js');

describe('VinculoEpisCargoPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarCargos.mockResolvedValue([
            { id: 'cargo-1', name: 'Operador', deletedAt: null },
            { id: 'cargo-2', name: 'Inativo', deletedAt: '2024-01-01' }
        ]);
        listarEpis.mockResolvedValue([
            { id: 'epi-1', name: 'Capacete', caNumber: '11070', isActive: true },
            { id: 'epi-2', name: 'Luva', caNumber: '22080', isActive: true }
        ]);
        listarEpisPorCargo.mockResolvedValue([
            {
                id: 'v1',
                periodicityDays: 180,
                epi: {
                    id: 'epi-1',
                    name: 'Capacete',
                    caNumber: '11070',
                    caExpirationDate: '2027-01-01',
                    isActive: true
                }
            }
        ]);
        vincularEpiAoCargo.mockResolvedValue(undefined);
        desvincularEpiDoCargo.mockResolvedValue(undefined);
    });

    it('deve carregar opcoes e solicitar selecao de cargo', async () => {
        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        expect(await screen.findByText(/selecione um cargo para gerenciar/i)).toBeInTheDocument();
        expect(listarCargos).toHaveBeenCalledWith('jwt', { incluirInativos: true });
    });

    it('deve exibir vinculos e epis disponiveis ao selecionar cargo', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/cargo para vincular epis/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/cargo para vincular epis/i), 'cargo-1');

        await waitFor(() => {
            expect(screen.getByText('Capacete')).toBeInTheDocument();
        });

        expect(screen.getByText('Luva')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /desvincular/i })).toBeInTheDocument();
    });

    it('deve vincular epi por ca e desvincular existente', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/cargo para vincular epis/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/cargo para vincular epis/i), 'cargo-1');

        await waitFor(() => {
            expect(screen.getByLabelText(/número do ca/i)).toBeInTheDocument();
        });

        await usuario.type(screen.getByLabelText(/número do ca/i), '33090');
        await usuario.click(screen.getByRole('button', { name: /vincular por ca/i }));

        await waitFor(() => {
            expect(vincularEpiAoCargo).toHaveBeenCalledWith(
                {
                    roleId: 'cargo-1',
                    caNumber: '33090',
                    periodicityDays: 180
                },
                'jwt'
            );
        });

        await usuario.click(screen.getByRole('button', { name: /desvincular/i }));
        await usuario.click(screen.getAllByRole('button', { name: /desvincular/i })[1]);

        await waitFor(() => {
            expect(desvincularEpiDoCargo).toHaveBeenCalledWith('cargo-1', 'epi-1', 'jwt');
        });
    });

    it('deve filtrar cache e exibir mensagem quando busca nao retornar resultados', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/cargo para vincular epis/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/cargo para vincular epis/i), 'cargo-1');

        await waitFor(() => {
            expect(screen.getByText('Luva')).toBeInTheDocument();
        });

        await usuario.type(
            screen.getByRole('searchbox', { name: /pesquisar epis em cache/i }),
            'inexistente'
        );

        expect(await screen.findByText(/nenhum epi encontrado para a busca/i)).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar carregamento inicial', async () => {
        listarCargos.mockRejectedValue(new Error('Falha ao carregar.'));

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        expect(await screen.findByText(/selecione um cargo para gerenciar/i)).toBeInTheDocument();
    });

    it('deve exibir carregamento inicial', () => {
        listarCargos.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/carregando opções/i)).toBeInTheDocument();
    });

    it('deve exibir erro ao carregar vinculos', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/cargo para vincular epis/i)).toBeInTheDocument();
        });

        listarEpisPorCargo.mockRejectedValueOnce(new Error('Falha nos vínculos.'));

        await usuario.selectOptions(screen.getByLabelText(/cargo para vincular epis/i), 'cargo-1');

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Falha nos vínculos.');
        });
    });

    it('deve cancelar dialogo de desvinculo', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/cargo para vincular epis/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/cargo para vincular epis/i), 'cargo-1');

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /desvincular/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /desvincular/i }));
        await usuario.click(screen.getByRole('button', { name: /cancelar/i }));

        expect(desvincularEpiDoCargo).not.toHaveBeenCalled();
    });

    it('deve exibir erro ao vincular por ca e ao desvincular', async () => {
        const usuario = userEvent.setup();
        vincularEpiAoCargo.mockRejectedValue(new Error('Falha ao vincular.'));
        desvincularEpiDoCargo.mockRejectedValue(new Error('Falha ao desvincular.'));

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/cargo para vincular epis/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/cargo para vincular epis/i), 'cargo-1');

        await waitFor(() => {
            expect(screen.getByLabelText(/número do ca/i)).toBeInTheDocument();
        });

        await usuario.type(screen.getByLabelText(/número do ca/i), '33090');
        await usuario.click(screen.getByRole('button', { name: /vincular por ca/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao vincular.');

        vincularEpiAoCargo.mockResolvedValue(undefined);
        desvincularEpiDoCargo.mockRejectedValue(new Error('Falha ao desvincular.'));

        await usuario.click(screen.getByRole('button', { name: /desvincular/i }));
        await usuario.click(screen.getAllByRole('button', { name: /desvincular/i })[1]);

        await waitFor(() => {
            const alertas = screen.getAllByRole('alert');
            expect(alertas.some((alerta) => alerta.textContent.includes('Falha ao desvincular.'))).toBe(
                true
            );
        });
    });

    it('deve exibir mensagem quando cache de epis estiver vazio', async () => {
        const usuario = userEvent.setup();
        listarEpis.mockResolvedValue([]);

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/cargo para vincular epis/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/cargo para vincular epis/i), 'cargo-1');

        expect(
            await screen.findByText(/nenhum epi ativo em cache disponível para vincular a este cargo/i)
        ).toBeInTheDocument();
    });

    it('deve exibir estado vazio quando nenhum cargo estiver selecionado', async () => {
        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        expect(await screen.findByText(/selecione um cargo para gerenciar/i)).toBeInTheDocument();
    });

    it('deve exibir carregamento de vinculos', async () => {
        const usuario = userEvent.setup();
        let resolver;
        listarEpisPorCargo.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        );

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/cargo para vincular epis/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByRole('option', { name: /operador/i })).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/cargo para vincular epis/i), 'cargo-1');

        expect(await screen.findByText(/carregando vínculos/i)).toBeInTheDocument();

        resolver([]);
        await waitFor(() => {
            expect(screen.queryByText(/carregando vínculos/i)).not.toBeInTheDocument();
        });
    });

    it('deve ignorar confirmacao de desvinculo sem cargo ou epi', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/cargo para vincular epis/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/cargo para vincular epis/i), 'cargo-1');

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /desvincular/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /desvincular/i }));
        await usuario.selectOptions(screen.getByLabelText(/cargo para vincular epis/i), '');
        await usuario.click(screen.getAllByRole('button', { name: /desvincular/i })[1]);

        expect(desvincularEpiDoCargo).not.toHaveBeenCalled();
    });

    it('deve usar mensagem padrao ao falhar carregamento inicial sem message', async () => {
        listarCargos.mockRejectedValue({});

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        expect(await screen.findByText(/selecione um cargo para gerenciar/i)).toBeInTheDocument();
    });

    it('deve usar mensagem padrao ao carregar vinculos sem message', async () => {
        const usuario = userEvent.setup();
        listarEpisPorCargo.mockRejectedValue({});

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/cargo para vincular epis/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/cargo para vincular epis/i), 'cargo-1');

        expect(
            await screen.findByText(/não foi possível carregar os vínculos do cargo/i)
        ).toBeInTheDocument();
    });

    it('deve limpar erro via callback do feedback', async () => {
        const usuario = userEvent.setup();
        const original = MensagemFeedback.AreaMensagensFeedback;
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.erro && props.onLimparErro) {
                props.onLimparErro();
            }

            return original(props);
        });

        vincularEpiAoCargo.mockRejectedValue(new Error('Falha ao vincular.'));

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/cargo para vincular epis/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/cargo para vincular epis/i), 'cargo-1');

        await waitFor(() => {
            expect(screen.getByLabelText(/número do ca/i)).toBeInTheDocument();
        });

        await usuario.type(screen.getByLabelText(/número do ca/i), '33090');
        await usuario.click(screen.getByRole('button', { name: /vincular por ca/i }));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });

    it('deve exibir titulo com cargo sem nome', async () => {
        listarCargos.mockResolvedValue([
            { id: 'cargo-1', name: 'Operador', deletedAt: null },
            { id: 'cargo-3', name: '', deletedAt: null }
        ]);

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/cargo para vincular epis/i)).toBeInTheDocument();
        });

        const usuario = userEvent.setup();
        await usuario.selectOptions(screen.getByLabelText(/cargo para vincular epis/i), 'cargo-3');

        expect(await screen.findByText(/vincular epis ao cargo/i)).toBeInTheDocument();
    });

    it('deve usar mensagem padrao ao falhar vinculo e desvinculo sem message', async () => {
        const usuario = userEvent.setup();
        vincularEpiAoCargo.mockRejectedValue({});
        desvincularEpiDoCargo.mockRejectedValue({});

        render(
            <MemoryRouter>
                <VinculoEpisCargoPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/cargo para vincular epis/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/cargo para vincular epis/i), 'cargo-1');

        await waitFor(() => {
            expect(screen.getByLabelText(/número do ca/i)).toBeInTheDocument();
        });

        await usuario.type(screen.getByLabelText(/número do ca/i), '33090');
        await usuario.click(screen.getByRole('button', { name: /vincular por ca/i }));

        expect(
            await screen.findByText(/não foi possível vincular o epi ao cargo/i)
        ).toBeInTheDocument();

        vincularEpiAoCargo.mockResolvedValue(undefined);
        await usuario.click(screen.getByRole('button', { name: /desvincular/i }));
        await usuario.click(screen.getAllByRole('button', { name: /desvincular/i })[1]);

        expect(
            await screen.findByText(/não foi possível desvincular o epi/i)
        ).toBeInTheDocument();
    });
});
