import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { UltimasEmissoesRelatorioEpiPage } from './UltimasEmissoesRelatorioEpiPage.jsx';

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

vi.mock('../services/epiRelatoriosApi.js', () => ({
    listarFuncionariosComHistoricoEmissoes: vi.fn(),
    listarRelatoriosEntregaEpi: vi.fn(),
    atualizarFlagsRelatorioEntregaEpi: vi.fn(),
    baixarPdfRelatorioEntregaEpi: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const {
    listarFuncionariosComHistoricoEmissoes,
    listarRelatoriosEntregaEpi,
    atualizarFlagsRelatorioEntregaEpi,
    baixarPdfRelatorioEntregaEpi
} = await import('../services/epiRelatoriosApi.js');

const relatorioBase = {
    id: 'r1',
    createdAt: '2026-01-15T10:00:00.000Z',
    periodStartDate: '2026-01-01',
    periodEndDate: '2026-01-31',
    employee: { name: 'Ana Silva', role: { name: 'Soldador' } },
    generatedBy: { name: 'Admin' },
    foiImpresso: false
};

const relatorios = {
    itens: [relatorioBase],
    pagina: 1,
    totalPaginas: 1,
    totalItens: 1
};

describe('UltimasEmissoesRelatorioEpiPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt', user: { role: 'ADMIN' } });
        listarFuncionariosComHistoricoEmissoes.mockResolvedValue([
            { id: 'f1', name: 'Ana Silva', roleName: 'Soldador' }
        ]);
        listarRelatoriosEntregaEpi.mockResolvedValue(relatorios);
        atualizarFlagsRelatorioEntregaEpi.mockResolvedValue({ foiImpresso: true });
        baixarPdfRelatorioEntregaEpi.mockResolvedValue(undefined);
    });

    it('deve carregar e exibir relatorios recentes', async () => {
        render(<UltimasEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByRole('cell', { name: 'Ana Silva' })).toBeInTheDocument();
        });

        expect(listarRelatoriosEntregaEpi).toHaveBeenCalled();
        expect(screen.getByRole('heading', { name: /últimas emissões/i })).toBeInTheDocument();
    });

    it('deve filtrar por funcionario e situacao', async () => {
        const usuario = userEvent.setup();
        render(<UltimasEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.selectOptions(screen.getByLabelText(/situação/i), 'true');

        await waitFor(() => {
            expect(listarRelatoriosEntregaEpi).toHaveBeenCalledWith(
                'jwt',
                expect.objectContaining({ employeeId: 'f1', foiAssinado: 'true' })
            );
        });
    });

    it('deve limpar filtros e paginar', async () => {
        const usuario = userEvent.setup();
        listarRelatoriosEntregaEpi
            .mockResolvedValueOnce({
                itens: [relatorioBase],
                pagina: 1,
                totalPaginas: 2,
                totalItens: 30
            })
            .mockResolvedValueOnce({
                itens: [relatorioBase],
                pagina: 2,
                totalPaginas: 2,
                totalItens: 30
            });

        render(<UltimasEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /limpar filtros/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /limpar filtros/i }));

        await waitFor(() => {
            expect(listarRelatoriosEntregaEpi).toHaveBeenLastCalledWith(
                'jwt',
                expect.objectContaining({ employeeId: undefined, foiAssinado: '' })
            );
        });

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));

        await waitFor(() => {
            expect(listarRelatoriosEntregaEpi).toHaveBeenLastCalledWith(
                'jwt',
                expect.objectContaining({ pagina: 2 })
            );
        });

        await usuario.click(screen.getByRole('button', { name: /anterior/i }));
    });

    it('deve exibir erro ao falhar carregamento de funcionarios', async () => {
        listarFuncionariosComHistoricoEmissoes.mockRejectedValue(new Error('Falha na API'));

        render(<UltimasEmissoesRelatorioEpiPage />);

        expect(await screen.findByText('Falha na API')).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar carregamento de funcionarios', async () => {
        listarFuncionariosComHistoricoEmissoes.mockRejectedValue(new Error());

        render(<UltimasEmissoesRelatorioEpiPage />);

        expect(await screen.findByText(/não foi possível carregar os funcionários/i)).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar carregamento de relatorios', async () => {
        listarRelatoriosEntregaEpi.mockRejectedValue(new Error('Erro nos relatórios'));

        render(<UltimasEmissoesRelatorioEpiPage />);

        expect(await screen.findByText('Erro nos relatórios')).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar carregamento de relatorios', async () => {
        listarRelatoriosEntregaEpi.mockRejectedValue(new Error());

        render(<UltimasEmissoesRelatorioEpiPage />);

        expect(await screen.findByText(/não foi possível carregar os relatórios/i)).toBeInTheDocument();
    });

    it('deve atualizar status e baixar pdf', async () => {
        const usuario = userEvent.setup();
        render(<UltimasEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /baixar pdf/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /baixar pdf/i }));
        expect(baixarPdfRelatorioEntregaEpi).toHaveBeenCalledWith('r1', 'jwt');

        await usuario.selectOptions(screen.getByLabelText(/status do documento/i), 'impresso');

        await waitFor(() => {
            expect(atualizarFlagsRelatorioEntregaEpi).toHaveBeenCalled();
        });
    });

    it('deve exibir erro generico ao falhar download', async () => {
        const usuario = userEvent.setup();
        baixarPdfRelatorioEntregaEpi.mockRejectedValue(new Error());

        render(<UltimasEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /baixar pdf/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /baixar pdf/i }));
        expect(await screen.findByText(/não foi possível baixar o pdf/i)).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar atualizacao de status', async () => {
        const usuario = userEvent.setup();
        listarRelatoriosEntregaEpi.mockResolvedValue({
            ...relatorios,
            itens: [{ ...relatorioBase, foiImpresso: true }]
        });
        atualizarFlagsRelatorioEntregaEpi.mockRejectedValue(new Error('Erro no status'));

        render(<UltimasEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/status do documento/i)).toBeEnabled();
        });

        await usuario.selectOptions(screen.getByLabelText(/status do documento/i), 'encaminhado');
        expect(await screen.findByText('Erro no status')).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar atualizacao de status', async () => {
        const usuario = userEvent.setup();
        listarRelatoriosEntregaEpi.mockResolvedValue({
            ...relatorios,
            itens: [{ ...relatorioBase, foiImpresso: true }]
        });
        atualizarFlagsRelatorioEntregaEpi.mockRejectedValue(new Error());

        render(<UltimasEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/status do documento/i)).toBeEnabled();
        });

        await usuario.selectOptions(screen.getByLabelText(/status do documento/i), 'assinado');

        expect(
            await screen.findByText(/não foi possível atualizar o status do documento/i)
        ).toBeInTheDocument();
    });

    it('deve ocultar edicao de status sem permissao', async () => {
        useAuth.mockReturnValue({ token: 'jwt', user: { role: 'ALMOXARIFADO' } });

        render(<UltimasEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByRole('cell', { name: 'Ana Silva' })).toBeInTheDocument();
        });

        expect(screen.queryByLabelText(/status do documento/i)).not.toBeInTheDocument();
    });

    it('deve tratar respostas vazias da api', async () => {
        listarFuncionariosComHistoricoEmissoes.mockResolvedValue(null);
        listarRelatoriosEntregaEpi.mockResolvedValue({});

        render(<UltimasEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getByText(/nenhum relatório encontrado/i)).toBeInTheDocument();
        });
    });

    it('deve atualizar apenas o relatorio alterado', async () => {
        const usuario = userEvent.setup();
        listarRelatoriosEntregaEpi.mockResolvedValue({
            itens: [
                { ...relatorioBase, id: 'r1', foiImpresso: true },
                { ...relatorioBase, id: 'r2', foiImpresso: true, employee: { name: 'Bruno', role: { name: 'Auxiliar' } } }
            ],
            pagina: 1,
            totalPaginas: 1,
            totalItens: 2
        });
        atualizarFlagsRelatorioEntregaEpi.mockResolvedValue({ foiEncaminhado: true });

        render(<UltimasEmissoesRelatorioEpiPage />);

        await waitFor(() => {
            expect(screen.getAllByLabelText(/status do documento/i)).toHaveLength(2);
        });

        await usuario.selectOptions(screen.getAllByLabelText(/status do documento/i)[1], 'encaminhado');

        await waitFor(() => {
            expect(atualizarFlagsRelatorioEntregaEpi).toHaveBeenCalledWith(
                'r2',
                expect.any(Object),
                'jwt'
            );
        });
    });

    it('deve limpar mensagem de erro', async () => {
        const usuario = userEvent.setup();
        listarRelatoriosEntregaEpi.mockRejectedValue(new Error('Erro nos relatórios'));

        render(<UltimasEmissoesRelatorioEpiPage />);

        expect(await screen.findByText('Erro nos relatórios')).toBeInTheDocument();
        await usuario.click(screen.getByRole('button', { name: 'limpar-erro' }));

        await waitFor(() => {
            expect(screen.queryByText('Erro nos relatórios')).not.toBeInTheDocument();
        });
    });
});
