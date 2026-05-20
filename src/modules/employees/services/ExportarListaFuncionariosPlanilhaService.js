import {
    FILTRO_EXPORTACAO_ATIVOS,
    FILTRO_EXPORTACAO_INATIVOS,
    FILTRO_EXPORTACAO_TODOS,
    FILTROS_EXPORTACAO_LISTA_FUNCIONARIOS,
    MENSAGEM_FILTRO_EXPORTACAO_INVALIDO,
    STATUS_FUNCIONARIO_ATIVOS,
    STATUS_FUNCIONARIO_INATIVOS
} from '../constants/funcionarioExportacaoConstantes.js';
import employeeRepository from '../repositories/EmployeeRepository.js';
import { montarLinhasExportacaoListaFuncionarios } from '../utils/montarLinhasExportacaoListaFuncionarios.js';
import planilhaFuncionarioProvider from '../../../shared/providers/PlanilhaFuncionarioProvider/PlanilhaFuncionarioProvider.js';

class ExportarListaFuncionariosPlanilhaService {
    /**
     * @param {string} filtroExportacao
     * @returns {Promise<{ buffer: Buffer, nomeArquivo: string }>}
     */
    async execute(filtroExportacao) {
        const filtroNormalizado = String(filtroExportacao || FILTRO_EXPORTACAO_ATIVOS)
            .trim()
            .toLowerCase();

        if (!FILTROS_EXPORTACAO_LISTA_FUNCIONARIOS.includes(filtroNormalizado)) {
            throw new Error(MENSAGEM_FILTRO_EXPORTACAO_INVALIDO);
        }

        const filtroStatus = this.montarFiltroStatus(filtroNormalizado);
        const funcionarios = await employeeRepository.findManyParaExportacaoLista(filtroStatus);
        const linhas = montarLinhasExportacaoListaFuncionarios(funcionarios);
        const buffer = await planilhaFuncionarioProvider.gerarPlanilhaListaFuncionarios(linhas);

        const dataAtual = new Date().toISOString().slice(0, 10);
        const nomeArquivo = `funcionarios-${filtroNormalizado}-${dataAtual}.xlsx`;

        return { buffer, nomeArquivo };
    }

    /**
     * @param {string} filtroExportacao
     * @returns {{ status?: { in: string[] } }}
     */
    montarFiltroStatus(filtroExportacao) {
        if (filtroExportacao === FILTRO_EXPORTACAO_ATIVOS) {
            return { status: { in: STATUS_FUNCIONARIO_ATIVOS } };
        }
        if (filtroExportacao === FILTRO_EXPORTACAO_INATIVOS) {
            return { status: { in: STATUS_FUNCIONARIO_INATIVOS } };
        }
        return {};
    }
}

export default new ExportarListaFuncionariosPlanilhaService();
