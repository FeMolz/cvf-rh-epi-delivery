import {
    ORDENACAO_ADMISSAO_ANTIGAS,
    ORDENACAO_ADMISSAO_RECENTES,
    ORDENACOES_ADMISSAO,
    MENSAGEM_ORDENACAO_ADMISSAO_INVALIDA,
    MENSAGEM_SITUACAO_CONSULTA_INVALIDA,
    SITUACAO_CONSULTA_FUNCIONARIOS_ATIVOS,
    SITUACAO_CONSULTA_FUNCIONARIOS_DEMITIDOS,
    SITUACAO_CONSULTA_FUNCIONARIOS_TODOS,
    SITUACOES_CONSULTA_FUNCIONARIOS
} from '../constants/departamentoPessoalConstantes.js';
import {
    STATUS_FUNCIONARIO_EM_EXERCICIO,
    STATUS_FUNCIONARIO_INATIVOS
} from '../constants/funcionarioStatusConstantes.js';
import { extrairDigitosCpf } from './validarCpf.js';
import { lancarErroFuncionario } from './lancarErroFuncionario.js';

/**
 * @param {string | undefined} situacaoBruta
 * @returns {Record<string, unknown>}
 */
export function montarFiltroStatusConsulta(situacaoBruta) {
    const situacao = String(situacaoBruta || SITUACAO_CONSULTA_FUNCIONARIOS_ATIVOS)
        .trim()
        .toLowerCase();

    if (!SITUACOES_CONSULTA_FUNCIONARIOS.includes(situacao)) {
        lancarErroFuncionario(MENSAGEM_SITUACAO_CONSULTA_INVALIDA);
    }

    if (situacao === SITUACAO_CONSULTA_FUNCIONARIOS_DEMITIDOS) {
        return { status: { in: STATUS_FUNCIONARIO_INATIVOS } };
    }

    if (situacao === SITUACAO_CONSULTA_FUNCIONARIOS_TODOS) {
        return {};
    }

    return { status: { in: STATUS_FUNCIONARIO_EM_EXERCICIO } };
}

/**
 * @param {string | undefined} buscaBruta
 * @returns {Record<string, unknown> | undefined}
 */
export function montarFiltroBuscaConsulta(buscaBruta) {
    const termo = String(buscaBruta || '').trim();

    if (!termo) {
        return undefined;
    }

    const digitosCpf = extrairDigitosCpf(termo);

    if (digitosCpf.length >= 3) {
        return {
            OR: [
                { name: { contains: termo, mode: 'insensitive' } },
                { cpf: { contains: termo, mode: 'insensitive' } },
                { cpf: { contains: digitosCpf, mode: 'insensitive' } }
            ]
        };
    }

    return {
        OR: [
            { name: { contains: termo, mode: 'insensitive' } },
            { cpf: { contains: termo, mode: 'insensitive' } }
        ]
    };
}

/**
 * @param {string | undefined} dataBruta
 * @returns {Date | undefined}
 */
function parsearDataConsulta(dataBruta) {
    const valor = String(dataBruta || '').trim();

    if (!valor) {
        return undefined;
    }

    const data = new Date(`${valor}T00:00:00.000Z`);

    if (Number.isNaN(data.getTime())) {
        lancarErroFuncionario('Data de admissão inválida.');
    }

    return data;
}

/**
 * @param {string | undefined} ordenacaoBruta
 * @returns {{ admissionDate: 'asc' | 'desc' }}
 */
export function montarOrdenacaoAdmissaoConsulta(ordenacaoBruta) {
    const ordenacao = String(ordenacaoBruta || ORDENACAO_ADMISSAO_RECENTES)
        .trim()
        .toLowerCase();

    if (!ORDENACOES_ADMISSAO.includes(ordenacao)) {
        lancarErroFuncionario(MENSAGEM_ORDENACAO_ADMISSAO_INVALIDA);
    }

    return {
        admissionDate: ordenacao === ORDENACAO_ADMISSAO_ANTIGAS ? 'asc' : 'desc'
    };
}

/**
 * @param {{
 *   companyId?: string;
 *   busca?: string;
 *   situacao?: string;
 *   admissaoDe?: string;
 *   admissaoAte?: string;
 * }} parametros
 * @returns {Record<string, unknown>}
 */
export function montarWhereConsultaFuncionarios(parametros = {}) {
    const situacao = String(parametros.situacao || SITUACAO_CONSULTA_FUNCIONARIOS_ATIVOS)
        .trim()
        .toLowerCase();

    const where = {
        ...montarFiltroStatusConsulta(parametros.situacao)
    };

    if (situacao === SITUACAO_CONSULTA_FUNCIONARIOS_ATIVOS) {
        where.deletedAt = null;
    }

    const companyId = String(parametros.companyId || '').trim();

    if (companyId) {
        where.companyId = companyId;
    }

    const filtroBusca = montarFiltroBuscaConsulta(parametros.busca);

    if (filtroBusca) {
        where.AND = [...(where.AND || []), filtroBusca];
    }

    const admissaoDe = parsearDataConsulta(parametros.admissaoDe);
    const admissaoAte = parsearDataConsulta(parametros.admissaoAte);

    if (admissaoDe || admissaoAte) {
        where.admissionDate = {};

        if (admissaoDe) {
            where.admissionDate.gte = admissaoDe;
        }

        if (admissaoAte) {
            const fim = new Date(admissaoAte);
            fim.setUTCHours(23, 59, 59, 999);
            where.admissionDate.lte = fim;
        }
    }

    return where;
}
