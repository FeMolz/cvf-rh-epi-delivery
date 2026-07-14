import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TabelaRelatoriosEntrega } from './TabelaRelatoriosEntrega.jsx';

const relatorioBase = {
    id: 'r1',
    createdAt: '2026-01-15T10:00:00.000Z',
    periodStartDate: '2026-01-01',
    periodEndDate: '2026-01-31',
    employee: { name: 'Ana Silva', role: { name: 'Soldador' } },
    generatedBy: { name: 'Admin' },
    foiImpresso: true
};

describe('TabelaRelatoriosEntrega', () => {
    it('deve exibir estado vazio', () => {
        render(
            <TabelaRelatoriosEntrega
                relatorios={[]}
                paginaAtual={1}
                totalPaginas={1}
                totalItens={0}
                onPaginaAnterior={vi.fn()}
                onProximaPagina={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarPdf={vi.fn()}
            />
        );

        expect(screen.getByText(/nenhum relatório encontrado/i)).toBeInTheDocument();
    });

    it('deve exibir relatorios e acionar download', async () => {
        const usuario = userEvent.setup();
        const onBaixarPdf = vi.fn();

        render(
            <TabelaRelatoriosEntrega
                relatorios={[relatorioBase]}
                paginaAtual={1}
                totalPaginas={1}
                totalItens={1}
                podeEditarStatus
                relatoriosComDownload={new Set(['r1'])}
                onPaginaAnterior={vi.fn()}
                onProximaPagina={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarPdf={onBaixarPdf}
            />
        );

        expect(screen.getByText('Ana Silva')).toBeInTheDocument();
        expect(screen.getByText('Soldador')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /baixar pdf/i }));

        expect(onBaixarPdf).toHaveBeenCalledWith('r1');
    });

    it('deve exibir paginacao quando houver mais de uma pagina', async () => {
        const usuario = userEvent.setup();
        const onProximaPagina = vi.fn();

        render(
            <TabelaRelatoriosEntrega
                relatorios={[relatorioBase]}
                paginaAtual={1}
                totalPaginas={2}
                totalItens={30}
                onPaginaAnterior={vi.fn()}
                onProximaPagina={onProximaPagina}
                onAlterarStatus={vi.fn()}
                onBaixarPdf={vi.fn()}
            />
        );

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));

        expect(onProximaPagina).toHaveBeenCalled();
    });

    it('deve exibir estado baixando', () => {
        render(
            <TabelaRelatoriosEntrega
                relatorios={[relatorioBase]}
                paginaAtual={1}
                totalPaginas={1}
                totalItens={1}
                relatorioBaixandoId="r1"
                onPaginaAnterior={vi.fn()}
                onProximaPagina={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarPdf={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: /baixando/i })).toBeDisabled();
    });

    it('deve acionar alteracao de status e pagina anterior', async () => {
        const usuario = userEvent.setup();
        const onAlterarStatus = vi.fn();
        const onPaginaAnterior = vi.fn();

        render(
            <TabelaRelatoriosEntrega
                relatorios={[{ ...relatorioBase, foiImpresso: false }]}
                paginaAtual={2}
                totalPaginas={2}
                totalItens={30}
                podeEditarStatus
                relatoriosComDownload={new Set(['r1'])}
                onPaginaAnterior={onPaginaAnterior}
                onProximaPagina={vi.fn()}
                onAlterarStatus={onAlterarStatus}
                onBaixarPdf={vi.fn()}
            />
        );

        await usuario.click(screen.getByRole('button', { name: /anterior/i }));
        expect(onPaginaAnterior).toHaveBeenCalled();

        await usuario.selectOptions(screen.getByLabelText(/status do documento/i), 'encaminhado');
        expect(onAlterarStatus).toHaveBeenCalledWith('r1', 'encaminhado');
    });

    it('deve ocultar edicao de status sem permissao', () => {
        render(
            <TabelaRelatoriosEntrega
                relatorios={[relatorioBase]}
                paginaAtual={1}
                totalPaginas={1}
                totalItens={1}
                podeEditarStatus={false}
                onPaginaAnterior={vi.fn()}
                onProximaPagina={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarPdf={vi.fn()}
            />
        );

        expect(screen.queryByLabelText(/status do documento/i)).not.toBeInTheDocument();
    });

    it('deve exibir tracos quando dados relacionados estiverem ausentes', () => {
        render(
            <TabelaRelatoriosEntrega
                relatorios={[
                    {
                        id: 'r2',
                        createdAt: '2026-01-15T10:00:00.000Z',
                        periodStartDate: '2026-01-01',
                        periodEndDate: '2026-01-31',
                        employee: null,
                        generatedBy: null,
                        foiImpresso: false
                    }
                ]}
                paginaAtual={1}
                totalPaginas={1}
                totalItens={1}
                relatorioProcessandoId="r2"
                onPaginaAnterior={vi.fn()}
                onProximaPagina={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarPdf={vi.fn()}
            />
        );

        expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
    });
});
