import {
    MENSAGEM_ORDENACAO_FERIAS_INVALIDA,
    MENSAGEM_PROXIMIDADE_FERIAS_INVALIDA,
    MENSAGEM_TAMANHO_PAGINA_FERIAS_INVALIDO,
    ORDENACAO_FERIAS_PROXIMOS_VENCIMENTOS,
    ORDENACAO_FERIAS_VENCIDOS_PRIMEIRO,
    ORDENACOES_FERIAS,
    PAGINA_FERIAS_PADRAO,
    PROXIMIDADES_FERIAS,
    TAMANHO_PAGINA_FERIAS_PADRAO,
    TAMANHOS_PAGINA_FERIAS
} from '../constants/departamentoPessoalConstantes.js';
import { montarFiltroBuscaConsulta } from './montarFiltroConsultaDepartamentoPessoal.js';
import { lancarErroFuncionario } from './lancarErroFuncionario.js';

/**
 * @returns {Date}
 */
export function obterInicioDiaReferencia(dataReferencia = new Date()) {
    const inicio = new Date(dataReferencia);
    inicio.setHours(0, 0, 0, 0);
    return inicio;
}

/**
 * @param {number} proximidadeDias
 * @param {Date} [dataReferencia]
 * @returns {Date}
 */
export function obterFimProximidadeFerias(proximidadeDias, dataReferencia = new Date()) {
    const fim = obterInicioDiaReferencia(dataReferencia);
    fim.setDate(fim.getDate() + proximidadeDias);
    fim.setHours(23, 59, 59, 999);
    return fim;
}

/**
 * @param {string | undefined} proximidadeBruta
 * @returns {number}
 */
export function normalizarProximidadeFerias(proximidadeBruta) {
    const proximidade = Number(proximidadeBruta || PROXIMIDADES_FERIAS[0]);

    if (!PROXIMIDADES_FERIAS.includes(proximidade)) {
        lancarErroFuncionario(MENSAGEM_PROXIMIDADE_FERIAS_INVALIDA);
    }

    return proximidade;
}

/**
 * @param {string | undefined} ordenacaoBruta
 * @returns {string}
 */
export function normalizarOrdenacaoFerias(ordenacaoBruta) {
    const ordenacao = String(ordenacaoBruta || ORDENACAO_FERIAS_PROXIMOS_VENCIMENTOS)
        .trim()
        .toLowerCase();

    if (!ORDENACOES_FERIAS.includes(ordenacao)) {
        lancarErroFuncionario(MENSAGEM_ORDENACAO_FERIAS_INVALIDA);
    }

    return ordenacao;
}

/**
 * @param {string | number | undefined} pageSizeBruto
 * @returns {number}
 */
export function normalizarTamanhoPaginaFerias(pageSizeBruto) {
    const pageSize = Number(pageSizeBruto || TAMANHO_PAGINA_FERIAS_PADRAO);

    if (!TAMANHOS_PAGINA_FERIAS.includes(pageSize)) {
        lancarErroFuncionario(MENSAGEM_TAMANHO_PAGINA_FERIAS_INVALIDO);
    }

    return pageSize;
}

/**
 * @param {string | number | undefined} pageBruta
 * @returns {number}
 */
export function normalizarPaginaFerias(pageBruta) {
    const pagina = Number(pageBruta || PAGINA_FERIAS_PADRAO);

    if (!Number.isInteger(pagina) || pagina < 1) {
        lancarErroFuncionario('Página inválida. Informe um número inteiro maior ou igual a 1.');
    }

    return pagina;
}

/**
 * @param {{
 *   busca?: string;
 *   proximidade?: string | number;
 * }} parametros
 * @param {Date} [dataReferencia]
 * @returns {Record<string, unknown>}
 */
export function montarWhereFerias(parametros = {}, dataReferencia = new Date()) {
    const proximidade = normalizarProximidadeFerias(parametros.proximidade);
    const inicioHoje = obterInicioDiaReferencia(dataReferencia);
    const fimProximidade = obterFimProximidadeFerias(proximidade, dataReferencia);

    const where = {
        deletedAt: null,
        status: 'FERIAS',
        OR: [
            { leaveReturnDate: { lt: inicioHoje } },
            {
                leaveReturnDate: {
                    gte: inicioHoje,
                    lte: fimProximidade
                }
            }
        ]
    };

    const filtroBusca = montarFiltroBuscaConsulta(parametros.busca);

    if (filtroBusca) {
        where.AND = [filtroBusca];
    }

    return where;
}

/**
 * @param {Array<{ leaveReturnDate?: Date | null }>} funcionarios
 * @param {Date} dataReferencia
 * @returns {Array<{ leaveReturnDate?: Date | null }>}
 */
export function ordenarFeriasVencidosPrimeiro(funcionarios, dataReferencia = new Date()) {
    const inicioHoje = obterInicioDiaReferencia(dataReferencia).getTime();

    const obterTimestamp = (funcionario) => {
        if (!funcionario.leaveReturnDate) {
            return Number.POSITIVE_INFINITY;
        }

        return new Date(funcionario.leaveReturnDate).getTime();
    };

    const ehVencido = (funcionario) => {
        if (!funcionario.leaveReturnDate) {
            return false;
        }

        return new Date(funcionario.leaveReturnDate).getTime() < inicioHoje;
    };

    return [...funcionarios].sort((a, b) => {
        const aVencido = ehVencido(a);
        const bVencido = ehVencido(b);

        if (aVencido !== bVencido) {
            return Number(bVencido) - Number(aVencido);
        }

        return obterTimestamp(a) - obterTimestamp(b);
    });
}

/**
 * @param {Array<{ leaveReturnDate?: Date | null }>} funcionarios
 * @returns {Array<{ leaveReturnDate?: Date | null }>}
 */
export function ordenarFeriasProximosVencimentos(funcionarios) {
    return [...funcionarios].sort((a, b) => {
        const timestampA = a.leaveReturnDate
            ? new Date(a.leaveReturnDate).getTime()
            : Number.POSITIVE_INFINITY;
        const timestampB = b.leaveReturnDate
            ? new Date(b.leaveReturnDate).getTime()
            : Number.POSITIVE_INFINITY;

        return timestampA - timestampB;
    });
}

export {
    ORDENACAO_FERIAS_PROXIMOS_VENCIMENTOS,
    ORDENACAO_FERIAS_VENCIDOS_PRIMEIRO
};
