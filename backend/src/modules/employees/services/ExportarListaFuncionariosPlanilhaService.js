import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import planilhaFuncionarioProvider from '../../../shared/providers/PlanilhaFuncionarioProvider/PlanilhaFuncionarioProvider.js';
import { FILTRO_LISTAGEM_FUNCIONARIOS_ATIVOS } from '../constants/funcionarioStatusConstantes.js';
import { FILTROS_EXPORTACAO_LISTA_FUNCIONARIOS } from '../constants/funcionarioExportacaoConstantes.js';
import employeeRepository from '../repositories/EmployeeRepository.js';
import { montarFiltroConsultaFuncionarios } from '../utils/montarFiltroConsultaFuncionarios.js';
import { montarLinhasExportacaoListaFuncionarios } from '../utils/montarLinhasExportacaoListaFuncionarios.js';
import { montarParesExportacaoFichaFuncionario } from '../utils/montarParesExportacaoFichaFuncionario.js';

/**
 * @param {unknown} idsBruto
 * @returns {string[]}
 */
function normalizarIdsExportacao(idsBruto) {
    if (!idsBruto) {
        return [];
    }

    const lista = Array.isArray(idsBruto) ? idsBruto : String(idsBruto).split(',');

    return [...new Set(lista.map((id) => String(id).trim()).filter(Boolean))];
}

class ExportarListaFuncionariosPlanilhaService {
    /**
     * @param {string[]} ids
     * @returns {Promise<{ buffer: Buffer, nomeArquivo: string }>}
     */
    async exportarFichasCompletas(ids) {
        const funcionarios = await employeeRepository.findManyParaExportacaoFicha(ids);

        if (funcionarios.length === 0) {
            throw criarErroNaoEncontrado('Nenhum funcionário encontrado para exportação');
        }

        const fichas = funcionarios.map((funcionario) => ({
            tituloBase: ids.length === 1 ? 'Funcionário' : String(funcionario.name || 'Funcionário'),
            paresCampoValor: montarParesExportacaoFichaFuncionario(funcionario)
        }));

        const buffer = await planilhaFuncionarioProvider.gerarPlanilhaFichasFuncionarios(fichas);
        const dataAtual = new Date().toISOString().slice(0, 10);

        if (ids.length === 1) {
            const nomeSanitizado = planilhaFuncionarioProvider.sanitizarNomeArquivo(
                funcionarios[0].name
            );

            return {
                buffer,
                nomeArquivo: `funcionario-${nomeSanitizado || ids[0]}.xlsx`
            };
        }

        return {
            buffer,
            nomeArquivo: `funcionarios-selecionados-${dataAtual}.xlsx`
        };
    }

    /**
     * @param {{
     *   filtro?: string,
     *   companyId?: string,
     *   ids?: string[] | string
     * }} [opcoes]
     * @returns {Promise<{ buffer: Buffer, nomeArquivo: string }>}
     */
    async execute(opcoes = {}) {
        const filtroExportacao = opcoes.filtro;
        const ids = normalizarIdsExportacao(opcoes.ids);
        const companyId = opcoes.companyId ? String(opcoes.companyId).trim() : '';

        if (ids.length > 0) {
            return this.exportarFichasCompletas(ids);
        }

        const filtroNormalizado = String(filtroExportacao || FILTRO_LISTAGEM_FUNCIONARIOS_ATIVOS)
            .trim()
            .toLowerCase();

        if (!FILTROS_EXPORTACAO_LISTA_FUNCIONARIOS.includes(filtroNormalizado)) {
            throw criarErroHttp(
                'Filtro de exportação inválido. Use os mesmos valores da listagem: ativos, afastados, inativos, todos, ferias, licenca_maternidade, licenca_med ou um status válido.'
            );
        }

        const filtroConsulta = { ...montarFiltroConsultaFuncionarios(filtroNormalizado) };

        if (companyId) {
            filtroConsulta.companyId = companyId;
        }

        const funcionarios = await employeeRepository.findManyParaExportacaoLista(filtroConsulta);
        const linhas = montarLinhasExportacaoListaFuncionarios(funcionarios);
        const buffer = await planilhaFuncionarioProvider.gerarPlanilhaListaFuncionarios(linhas);

        const dataAtual = new Date().toISOString().slice(0, 10);
        const sufixoArquivo = companyId ? `empresa-${companyId}` : filtroNormalizado;
        const nomeArquivo = `funcionarios-${sufixoArquivo}-${dataAtual}.xlsx`;

        return { buffer, nomeArquivo };
    }
}

export default new ExportarListaFuncionariosPlanilhaService();
