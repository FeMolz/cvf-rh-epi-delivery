import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

import { HistoricoEmissoesRelatorioEpiPage } from './HistoricoEmissoesRelatorioEpiPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/epiRelatoriosApi.js', () => ({
    listarFuncionariosComHistoricoEmissoes: vi.fn(),
    listarRelatoriosEntregaEpi: vi.fn(),
    listarArquivoRelatoriosFuncionario: vi.fn(),
    atualizarFlagsRelatorioEntregaEpi: vi.fn(),
    baixarPdfRelatorioEntregaEpi: vi.fn()
}));

vi.mock('../components/FiltrosHistoricoEmissoes.jsx', () => ({
    FiltrosHistoricoEmissoes: ({
        onBuscar,
        onLimpar,
        onAlterarEmployeeId,
        onAlterarEmissaoInicio,
        onAlterarEmissaoFim,
        employeeId,
        emissaoInicio,
        emissaoFim
    }) => (
        <div>
            <label htmlFor="historico-funcionario">Funcionário</label>
            <select
                id="historico-funcionario"
                value={employeeId}
                onChange={(evento) => onAlterarEmployeeId(evento.target.value)}
            >
                <option value="">Selecione…</option>
                <option value="f1">Ana Silva</option>
            </select>
            <label htmlFor="historico-emissao-inicio">Emissão de</label>
            <input
                id="historico-emissao-inicio"
                type="date"
                value={emissaoInicio}
                onChange={(evento) => onAlterarEmissaoInicio(evento.target.value)}
            />
            <label htmlFor="historico-emissao-fim">Emissão até</label>
            <input
                id="historico-emissao-fim"
                type="date"
                value={emissaoFim}
                onChange={(evento) => onAlterarEmissaoFim(evento.target.value)}
            />
            <button type="button" onClick={onBuscar} disabled={!employeeId}>
                Buscar emissões
            </button>
            <button type="button" onClick={onLimpar}>
                Limpar
            </button>
            <button type="button" onClick={() => onBuscar()}>
                Forcar busca
            </button>
        </div>
    )
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const {
    listarFuncionariosComHistoricoEmissoes,
    listarArquivoRelatoriosFuncionario,
    listarRelatoriosEntregaEpi,
    atualizarFlagsRelatorioEntregaEpi,
    baixarPdfRelatorioEntregaEpi
} = await import('../services/epiRelatoriosApi.js');

const funcionarios = [{ id: 'f1', name: 'Ana Silva', roleName: 'Soldador' }];
const relatorios = [
    {
        id: 'r1',
        createdAt: '2026-01-15T10:00:00.000Z',
        periodStartDate: '2026-01-01',
        periodEndDate: '2026-01-31',
        generatedBy: { name: 'Admin' },
        foiImpresso: true
    }
];

describe('HistoricoEmissoesRelatorioEpiPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt', user: { role: 'ADMIN' } });
        listarFuncionariosComHistoricoEmissoes.mockResolvedValue(funcionarios);
        listarArquivoRelatoriosFuncionario.mockResolvedValue(relatorios);
        baixarPdfRelatorioEntregaEpi.mockResolvedValue(undefined);
    });

    it('deve carregar funcionarios e buscar historico', async () => {
        const usuario = userEvent.setup();
        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        await waitFor(() => {
            expect(listarArquivoRelatoriosFuncionario).toHaveBeenCalledWith('f1', 'jwt');
            expect(screen.getAllByText('Ana Silva').length).toBeGreaterThan(0);
        });
    });

    it('deve validar periodo incompleto ao buscar', async () => {
        const usuario = userEvent.setup();
        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.type(screen.getByLabelText(/emissão de/i), '2026-01-01');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        expect(screen.getByText(/informe o início e o fim do período/i)).toBeInTheDocument();
    });

    it('deve validar busca sem funcionario e periodo apenas com fim', async () => {
        const usuario = userEvent.setup();
        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /forcar busca/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /forcar busca/i }));
        expect(screen.getByText(/selecione um funcionário para consultar o histórico/i)).toBeInTheDocument();

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.type(screen.getByLabelText(/emissão até/i), '2026-01-31');
        await usuario.click(screen.getByRole('button', { name: /forcar busca/i }));

        expect(screen.getByText(/informe o início e o fim do período/i)).toBeInTheDocument();
    });

    it('deve limpar filtros', async () => {
        const usuario = userEvent.setup();
        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /limpar/i }));

        expect(screen.getByLabelText(/funcionário/i)).toHaveValue('');
    });

    it('deve manter busca desabilitada sem funcionario', async () => {
        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /buscar emissões/i })).toBeDisabled();
        });
    });

    it('deve buscar por periodo completo', async () => {
        const usuario = userEvent.setup();
        listarRelatoriosEntregaEpi.mockResolvedValue({ itens: relatorios });

        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.type(screen.getByLabelText(/emissão de/i), '2026-01-01');
        await usuario.type(screen.getByLabelText(/emissão até/i), '2026-01-31');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        await waitFor(() => {
            expect(listarRelatoriosEntregaEpi).toHaveBeenCalledWith(
                'jwt',
                expect.objectContaining({
                    employeeId: 'f1',
                    emissaoInicio: '2026-01-01',
                    emissaoFim: '2026-01-31'
                })
            );
        });
    });

    it('deve exibir erro ao falhar carregamento de funcionarios', async () => {
        listarFuncionariosComHistoricoEmissoes.mockRejectedValue(new Error('Falha na API'));

        render(<HistoricoEmissoesRelatorioEpiPage />);

        expect(await screen.findByText('Falha na API')).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar busca e permitir limpar', async () => {
        const usuario = userEvent.setup();
        listarArquivoRelatoriosFuncionario.mockRejectedValue(new Error('Erro na busca'));

        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        expect(await screen.findByText('Erro na busca')).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar busca', async () => {
        const usuario = userEvent.setup();
        listarArquivoRelatoriosFuncionario.mockRejectedValue(new Error());

        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        expect(await screen.findByText(/não foi possível carregar as emissões/i)).toBeInTheDocument();
    });

    it('deve exibir carregamento ao buscar novamente', async () => {
        const usuario = userEvent.setup();
        listarArquivoRelatoriosFuncionario.mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(relatorios), 200))
        );

        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /baixar pdf/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        expect(await screen.findByText(/carregando emissões/i)).toBeInTheDocument();
    });

    it('deve atualizar status e baixar pdf', async () => {
        const usuario = userEvent.setup();
        atualizarFlagsRelatorioEntregaEpi.mockResolvedValue({ foiImpresso: false });

        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /baixar pdf/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /baixar pdf/i }));
        expect(baixarPdfRelatorioEntregaEpi).toHaveBeenCalledWith('r1', 'jwt');
    });

    it('deve atualizar status do relatorio', async () => {
        const usuario = userEvent.setup();
        atualizarFlagsRelatorioEntregaEpi.mockResolvedValue({ foiImpresso: true, foiEncaminhado: true });

        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /baixar pdf/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /baixar pdf/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/status do documento/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/status do documento/i), 'encaminhado');

        await waitFor(() => {
            expect(atualizarFlagsRelatorioEntregaEpi).toHaveBeenCalled();
        });
    });

    it('deve exibir erro generico ao falhar download', async () => {
        const usuario = userEvent.setup();
        baixarPdfRelatorioEntregaEpi.mockRejectedValue(new Error());

        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /baixar pdf/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /baixar pdf/i }));

        expect(await screen.findByText(/não foi possível baixar o pdf/i)).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar atualizacao de status', async () => {
        const usuario = userEvent.setup();
        atualizarFlagsRelatorioEntregaEpi.mockRejectedValue(new Error('Erro no status'));

        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/status do documento/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/status do documento/i), 'encaminhado');

        expect(await screen.findByText('Erro no status')).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar atualizacao de status', async () => {
        const usuario = userEvent.setup();
        atualizarFlagsRelatorioEntregaEpi.mockRejectedValue(new Error());

        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/status do documento/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/status do documento/i), 'encaminhado');

        expect(
            await screen.findByText(/não foi possível atualizar o status do documento/i)
        ).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar carregamento de funcionarios', async () => {
        listarFuncionariosComHistoricoEmissoes.mockRejectedValue(new Error());

        render(<HistoricoEmissoesRelatorioEpiPage />);

        expect(
            await screen.findByText(/não foi possível carregar os funcionários/i)
        ).toBeInTheDocument();
    });

    it('deve atualizar apenas o relatorio selecionado quando houver varios', async () => {
        const usuario = userEvent.setup();
        listarArquivoRelatoriosFuncionario.mockResolvedValue([
            {
                id: 'r1',
                createdAt: '2026-01-15T10:00:00.000Z',
                periodStartDate: '2026-01-01',
                periodEndDate: '2026-01-31',
                generatedBy: { name: 'Admin' },
                foiImpresso: true,
                employee: { name: 'Ana Silva' }
            },
            {
                id: 'r2',
                createdAt: '2026-02-15T10:00:00.000Z',
                periodStartDate: '2026-02-01',
                periodEndDate: '2026-02-28',
                generatedBy: { name: 'Admin' },
                foiImpresso: false,
                employee: { name: 'Ana Silva' }
            }
        ]);
        atualizarFlagsRelatorioEntregaEpi.mockResolvedValue({
            foiImpresso: true,
            foiEncaminhado: true
        });

        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        await waitFor(() => {
            expect(screen.getAllByLabelText(/status do documento/i)).toHaveLength(2);
        });

        await usuario.selectOptions(screen.getAllByLabelText(/status do documento/i)[0], 'encaminhado');

        await waitFor(() => {
            expect(atualizarFlagsRelatorioEntregaEpi).toHaveBeenCalledWith(
                'r1',
                expect.any(Object),
                'jwt'
            );
        });
    });

    it('deve tolerar lista nula de funcionarios ao iniciar', async () => {
        listarFuncionariosComHistoricoEmissoes.mockResolvedValue(null);

        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });
    });

    it('deve buscar historico por periodo com itens nulos', async () => {
        const usuario = userEvent.setup();
        listarRelatoriosEntregaEpi.mockResolvedValue({});

        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.type(screen.getByLabelText(/emissão de/i), '2026-01-01');
        await usuario.type(screen.getByLabelText(/emissão até/i), '2026-01-31');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        await waitFor(() => {
            expect(listarRelatoriosEntregaEpi).toHaveBeenCalled();
        });
    });

    it('deve limpar mensagem de erro automaticamente', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        listarArquivoRelatoriosFuncionario.mockRejectedValue(new Error('Erro temporário'));
        const usuario = userEvent.setup();

        render(<HistoricoEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));

        expect(await screen.findByText('Erro temporário')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        await waitFor(() => {
            expect(screen.queryByText('Erro temporário')).not.toBeInTheDocument();
        });
        vi.useRealTimers();
    });
});
