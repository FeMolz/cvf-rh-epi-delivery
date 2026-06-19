import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import planilhaFuncionarioProvider from '../../../shared/providers/PlanilhaFuncionarioProvider/PlanilhaFuncionarioProvider.js';
import { FILTRO_LISTAGEM_FUNCIONARIOS_ATIVOS } from '../constants/funcionarioStatusConstantes.js';
import { FILTROS_EXPORTACAO_LISTA_FUNCIONARIOS } from '../constants/funcionarioExportacaoConstantes.js';
import employeeRepository from '../repositories/EmployeeRepository.js';
import { montarFiltroConsultaFuncionarios } from '../utils/montarFiltroConsultaFuncionarios.js';
import { montarLinhasExportacaoListaFuncionarios } from '../utils/montarLinhasExportacaoListaFuncionarios.js';

class ExportarListaFuncionariosPlanilhaService {
    /**
     * @param {string} filtroExportacao
     * @returns {Promise<{ buffer: Buffer, nomeArquivo: string }>}
     */
    async execute(filtroExportacao) {
        const filtroNormalizado = String(filtroExportacao || FILTRO_LISTAGEM_FUNCIONARIOS_ATIVOS)
            .trim()
            .toLowerCase();

        if (!FILTROS_EXPORTACAO_LISTA_FUNCIONARIOS.includes(filtroNormalizado)) {
            throw criarErroHttp(
                'Filtro de exportação inválido. Use os mesmos valores da listagem: ativos, afastados, inativos, todos, ferias, licenca_maternidade, licenca_med ou um status válido.'
            );
        }

        const filtroConsulta = montarFiltroConsultaFuncionarios(filtroNormalizado);
        const funcionarios = await employeeRepository.findManyParaExportacaoLista(filtroConsulta);
        const linhas = montarLinhasExportacaoListaFuncionarios(funcionarios);
        const buffer = await planilhaFuncionarioProvider.gerarPlanilhaListaFuncionarios(linhas);

        const dataAtual = new Date().toISOString().slice(0, 10);
        const nomeArquivo = `funcionarios-${filtroNormalizado}-${dataAtual}.xlsx`;

        return { buffer, nomeArquivo };
    }
}

export default new ExportarListaFuncionariosPlanilhaService();
