import { describe, expect, it, vi } from 'vitest';

import {
    atualizarFlagsRelatorioEntregaEpi,
    baixarPdfRelatorioEntregaEpi,
    buscarPreviewRelatorioEntregaEpi,
    emitirRelatorioEntregaEpi,
    listarArquivoRelatoriosFuncionario,
    listarFuncionariosComHistoricoEmissoes,
    listarFuncionariosElegiveisEmissaoRelatorio,
    listarRelatoriosEntregaEpi
} from './epiRelatoriosApi.js';

vi.mock('../../../shared/api/clienteHttp.js', () => ({
    requisicaoApi: vi.fn(),
    baixarArquivoApi: vi.fn()
}));

const { requisicaoApi, baixarArquivoApi } = await import('../../../shared/api/clienteHttp.js');

describe('epiRelatoriosApi', () => {
    it('deve listar relatorios com filtros', async () => {
        requisicaoApi.mockResolvedValue({ itens: [], pagina: 1, totalItens: 0 });

        await listarRelatoriosEntregaEpi('token', {
            employeeId: 'e1',
            foiAssinado: 'false',
            emissaoInicio: '2026-01-01',
            emissaoFim: '2026-01-31',
            pagina: 2,
            limite: 10
        });

        expect(requisicaoApi).toHaveBeenCalledWith(
            '/epi-delivery-reports?employeeId=e1&foiAssinado=false&emissaoInicio=2026-01-01&emissaoFim=2026-01-31&pagina=2&limite=10',
            { token: 'token' }
        );
    });

    it('deve buscar preview do relatorio', async () => {
        requisicaoApi.mockResolvedValue({ entregas: [] });

        await buscarPreviewRelatorioEntregaEpi('token', {
            employeeId: 'e1',
            periodoInicio: '2026-01-01',
            periodoFim: '2026-01-31'
        });

        expect(requisicaoApi).toHaveBeenCalledWith(
            '/epi-delivery-reports/preview?employeeId=e1&periodoInicio=2026-01-01&periodoFim=2026-01-31',
            { token: 'token' }
        );
    });

    it('deve listar relatorios com filtro de ultimos dias', async () => {
        requisicaoApi.mockResolvedValue({ itens: [], pagina: 1, totalItens: 0 });

        await listarRelatoriosEntregaEpi('token', { ultimosDias: 15, pagina: 1 });

        expect(requisicaoApi).toHaveBeenCalledWith('/epi-delivery-reports?ultimosDias=15&pagina=1', {
            token: 'token'
        });
    });

    it('deve listar funcionarios elegiveis para emissao', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarFuncionariosElegiveisEmissaoRelatorio('token');

        expect(requisicaoApi).toHaveBeenCalledWith(
            '/epi-delivery-reports/employees/eligible-for-emission',
            { token: 'token' }
        );
    });

    it('deve listar funcionarios com historico', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarFuncionariosComHistoricoEmissoes('token');

        expect(requisicaoApi).toHaveBeenCalledWith('/epi-delivery-reports/employees/with-reports', {
            token: 'token'
        });
    });

    it('deve listar arquivo de relatorios do funcionario', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarArquivoRelatoriosFuncionario('e1', 'token');

        expect(requisicaoApi).toHaveBeenCalledWith('/epi-delivery-reports/employee/e1/archive', {
            token: 'token'
        });
    });

    it('deve emitir relatorio', async () => {
        requisicaoApi.mockResolvedValue({ id: 'r1' });

        await emitirRelatorioEntregaEpi(
            {
                employeeId: 'e1',
                periodoInicio: '2026-01-01',
                periodoFim: '2026-01-31'
            },
            'token'
        );

        expect(requisicaoApi).toHaveBeenCalledWith('/epi-delivery-reports', {
            method: 'POST',
            body: {
                employeeId: 'e1',
                periodoInicio: '2026-01-01',
                periodoFim: '2026-01-31'
            },
            token: 'token'
        });
    });

    it('deve atualizar flags do relatorio', async () => {
        requisicaoApi.mockResolvedValue({ id: 'r1', foiImpresso: true });

        await atualizarFlagsRelatorioEntregaEpi('r1', { foiImpresso: true }, 'token');

        expect(requisicaoApi).toHaveBeenCalledWith('/epi-delivery-reports/r1/flags', {
            method: 'PATCH',
            body: { foiImpresso: true },
            token: 'token'
        });
    });

    it('deve baixar pdf do relatorio', async () => {
        baixarArquivoApi.mockResolvedValue(undefined);

        await baixarPdfRelatorioEntregaEpi('r1', 'token', 'relatorio.pdf');

        expect(baixarArquivoApi).toHaveBeenCalledWith('/epi-delivery-reports/r1/pdf', {
            token: 'token',
            nomeArquivoPadrao: 'relatorio.pdf'
        });
    });
});
