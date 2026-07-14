import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RegistroEntregaEpiPage } from './RegistroEntregaEpiPage.jsx';

function renderizarPagina() {
    return render(
        <MemoryRouter>
            <RegistroEntregaEpiPage />
        </MemoryRouter>
    );
}

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/epiEntregasApi.js', () => ({
    buscarPainelEntregasEpi: vi.fn(),
    buscarSituacaoEpisFuncionario: vi.fn(),
    registrarEntregaEpi: vi.fn()
}));

vi.mock('../../epis/services/episApi.js', () => ({
    listarEpis: vi.fn()
}));

vi.mock('../components/FormularioEntregaEpi.jsx', () => ({
    FormularioEntregaEpi: ({
        onEntregar,
        onSelecionarFuncionario,
        onAlterarDataEntrega,
        onAlternarEpi,
        funcionarioSelecionadoId
    }) => (
        <div>
            <label htmlFor="entrega-funcionario">Funcionário</label>
            <select
                id="entrega-funcionario"
                value={funcionarioSelecionadoId}
                onChange={(evento) => onSelecionarFuncionario(evento.target.value)}
            >
                <option value="">Selecione…</option>
                <option value="f1">Ana Silva</option>
                <option value="f2">Bruno Costa</option>
            </select>
            <label htmlFor="entrega-data">Data da entrega</label>
            <input
                id="entrega-data"
                type="date"
                defaultValue="2026-07-10"
                onChange={(evento) => onAlterarDataEntrega(evento.target.value)}
            />
            <button type="button" onClick={() => onAlternarEpi('12345')}>
                Alternar EPI
            </button>
            <button type="button" onClick={onEntregar}>
                Entregar
            </button>
            <button type="button" onClick={onEntregar}>
                Forcar entrega
            </button>
        </div>
    )
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { buscarPainelEntregasEpi, buscarSituacaoEpisFuncionario, registrarEntregaEpi } =
    await import('../services/epiEntregasApi.js');
const { listarEpis } = await import('../../epis/services/episApi.js');

const funcionarios = [
    {
        id: 'f1',
        name: 'Ana Silva',
        roleName: 'Soldador',
        resumoEpis: { emDia: 1, vencidos: 0, pendentes: 0 }
    },
    {
        id: 'f2',
        name: 'Bruno Costa',
        roleName: 'Auxiliar',
        resumoEpis: { emDia: 0, vencidos: 0, pendentes: 0 }
    }
];

const episFuncionario = [
    {
        epiId: 'e1',
        caNumber: '12345',
        name: 'Capacete',
        caExpirationDate: '2027-01-01',
        lastDeliveryDate: '2026-01-01',
        nextDueDate: '2027-01-01',
        situacao: 'em_dia'
    }
];

describe('RegistroEntregaEpiPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        buscarPainelEntregasEpi.mockResolvedValue({ funcionariosElegiveis: funcionarios, episVencidos: [] });
        listarEpis.mockResolvedValue([]);
        buscarSituacaoEpisFuncionario.mockResolvedValue({ epis: episFuncionario });
        registrarEntregaEpi.mockResolvedValue({ message: 'Entrega registrada com sucesso.' });
    });

    it('deve carregar painel e listar funcionarios', async () => {
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Ana Silva' })).toBeInTheDocument();
        });
    });

    it('deve selecionar funcionario e registrar entrega', async () => {
        const usuario = userEvent.setup();
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /alternar epi/i }));
        await usuario.click(screen.getByRole('button', { name: /^entregar$/i }));

        await waitFor(() => {
            expect(registrarEntregaEpi).toHaveBeenCalled();
            expect(screen.getByText(/entrega registrada com sucesso/i)).toBeInTheDocument();
        });
    });

    it('deve selecionar funcionario pela tabela e desmarcar epi', async () => {
        const usuario = userEvent.setup();
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Ana Silva' })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: 'Ana Silva' }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /alternar epi/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /alternar epi/i }));
        await usuario.click(screen.getByRole('button', { name: /alternar epi/i }));
    });

    it('deve exibir funcionario sem epis vinculados', async () => {
        const usuario = userEvent.setup();
        buscarSituacaoEpisFuncionario.mockResolvedValue({ epis: [] });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f2');

        await waitFor(() => {
            expect(
                screen.getByText(/cargo sem epis vinculados/i)
            ).toBeInTheDocument();
        });
    });

    it('deve exibir erro ao falhar carregamento do painel', async () => {
        buscarPainelEntregasEpi.mockRejectedValue(new Error('Falha no painel'));

        renderizarPagina();

        expect(await screen.findByText('Falha no painel')).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar carregamento do painel', async () => {
        buscarPainelEntregasEpi.mockRejectedValue(new Error());

        renderizarPagina();

        expect(
            await screen.findByText(/não foi possível carregar o painel de entregas/i)
        ).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar carregamento dos epis do funcionario', async () => {
        const usuario = userEvent.setup();
        buscarSituacaoEpisFuncionario.mockRejectedValue(new Error('Erro nos EPIs'));

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');

        expect(await screen.findByText('Erro nos EPIs')).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar registro da entrega', async () => {
        const usuario = userEvent.setup();
        registrarEntregaEpi.mockRejectedValue(new Error('Falha na entrega'));

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /alternar epi/i }));
        await usuario.click(screen.getByRole('button', { name: /^entregar$/i }));

        expect(await screen.findByText('Falha na entrega')).toBeInTheDocument();
    });

    it('deve validar entrega sem funcionario, epis ou data', async () => {
        const usuario = userEvent.setup();
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /forcar entrega/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /forcar entrega/i }));
        expect(
            await screen.findByText(/selecione um funcionário e ao menos um epi para entregar/i)
        ).toBeInTheDocument();

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /forcar entrega/i }));
        expect(
            await screen.findByText(/selecione um funcionário e ao menos um epi para entregar/i)
        ).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /alternar epi/i }));
        const campoData = screen.getByLabelText(/data da entrega/i);
        await usuario.clear(campoData);
        await usuario.click(screen.getByRole('button', { name: /forcar entrega/i }));

        expect(await screen.findByText(/informe a data da entrega/i)).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar registro e carregar epis do funcionario', async () => {
        const usuario = userEvent.setup();
        registrarEntregaEpi.mockRejectedValue(new Error());
        buscarSituacaoEpisFuncionario.mockRejectedValue(new Error());

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        expect(
            await screen.findByText(/não foi possível carregar os epis do funcionário/i)
        ).toBeInTheDocument();

        buscarSituacaoEpisFuncionario.mockResolvedValue({ epis: episFuncionario });
        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), '');
        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /alternar epi/i }));
        await usuario.click(screen.getByRole('button', { name: /^entregar$/i }));

        expect(await screen.findByText(/não foi possível registrar a entrega/i)).toBeInTheDocument();
    });

    it('deve usar mensagem padrao quando api nao retornar texto', async () => {
        const usuario = userEvent.setup();
        registrarEntregaEpi.mockResolvedValue({});

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /alternar epi/i }));
        await usuario.click(screen.getByRole('button', { name: /^entregar$/i }));

        expect(await screen.findByText(/entrega registrada com sucesso/i)).toBeInTheDocument();
    });

    it('deve limpar mensagens de feedback automaticamente', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const usuario = userEvent.setup();
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /alternar epi/i }));
        await usuario.click(screen.getByRole('button', { name: /^entregar$/i }));

        expect(await screen.findByText(/entrega registrada com sucesso/i)).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        await waitFor(() => {
            expect(screen.queryByText(/entrega registrada com sucesso/i)).not.toBeInTheDocument();
        });
        vi.useRealTimers();
    });

    it('deve tolerar painel e cache sem listas', async () => {
        buscarPainelEntregasEpi.mockResolvedValue({});
        listarEpis.mockResolvedValue(null);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByText(/nenhum funcionário ativo encontrado/i)).toBeInTheDocument();
        });
    });

    it('deve exibir titulo sem nome do funcionario selecionado', async () => {
        const usuario = userEvent.setup();
        buscarPainelEntregasEpi.mockResolvedValue({
            funcionariosElegiveis: [{ id: 'f1', roleName: 'Soldador', resumoEpis: { emDia: 0, vencidos: 0, pendentes: 0 } }]
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');

        expect(await screen.findByText(/epis do funcionário/i)).toBeInTheDocument();
    });

    it('deve tolerar epis nulos ao carregar situacao do funcionario', async () => {
        const usuario = userEvent.setup();
        buscarSituacaoEpisFuncionario.mockResolvedValue({});

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');

        expect(await screen.findByText(/cargo sem epis vinculados/i)).toBeInTheDocument();
    });

    it('deve limpar mensagens via callbacks do feedback', async () => {
        const usuario = userEvent.setup();
        const original = (await import('../../../shared/components/MensagemFeedback.jsx'))
            .AreaMensagensFeedback;
        const MensagemFeedback = await import('../../../shared/components/MensagemFeedback.jsx');
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.erro && props.onLimparErro) {
                props.onLimparErro();
            }

            if (props.sucesso && props.onLimparSucesso) {
                props.onLimparSucesso();
            }

            return original(props);
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /alternar epi/i }));
        await usuario.click(screen.getByRole('button', { name: /^entregar$/i }));

        await waitFor(() => {
            expect(screen.queryByText(/entrega registrada com sucesso/i)).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });

    it('deve desmarcar funcionario selecionado', async () => {
        const usuario = userEvent.setup();

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Ana Silva' })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: 'Ana Silva' }));
        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), '');

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Ana Silva' })).toBeInTheDocument();
        });
    });

    it('deve limpar erro via callback onLimparErro', async () => {
        const original = (await import('../../../shared/components/MensagemFeedback.jsx'))
            .AreaMensagensFeedback;
        const MensagemFeedback = await import('../../../shared/components/MensagemFeedback.jsx');
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.erro && props.onLimparErro) {
                props.onLimparErro();
            }

            return original(props);
        });

        buscarPainelEntregasEpi.mockRejectedValue(new Error('Falha no painel'));
        renderizarPagina();

        await waitFor(() => {
            expect(screen.queryByText('Falha no painel')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });
});
