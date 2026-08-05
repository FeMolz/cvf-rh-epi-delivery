import { parsearDataSomenteDia } from './afastamentoTemporarioFuncionario.js';

/**
 * Monta o objeto de persistência do funcionário a partir da entrada da API.
 * @param {Record<string, unknown>} entrada
 * @returns {Record<string, unknown>}
 */
export function montarDadosFuncionario(entrada) {
    const {
        name,
        cpf,
        email,
        telefone,
        birthDate,
        status,
        admissionDate,
        resignationDate,
        leaveReturnDate,
        companyId,
        roleId,
        setorId,
        nacionalidade,
        estadoCivil,
        racaCor,
        filiacao,
        grauInstrucao,
        numeroCtps,
        serieCtps,
        numeroDependentes,
        pis,
        chavePix,
        cep,
        logradouro,
        numeroEndereco,
        complemento,
        bairro,
        cidade,
        estado,
        valeTransporte,
        valeAlimentacao,
        planoSaude
    } = entrada;

    const dados = {
        name,
        cpf,
        email,
        telefone,
        birthDate: converterDataFuncionario(birthDate),
        status: status || 'ATIVO',
        admissionDate: converterDataFuncionario(admissionDate) ?? new Date(),
        resignationDate: converterDataFuncionario(resignationDate),
        leaveReturnDate: converterDataFuncionario(leaveReturnDate),
        companyId,
        roleId,
        setorId
    };

    const camposOpcionais = {
        nacionalidade,
        estadoCivil,
        racaCor,
        filiacao,
        grauInstrucao,
        numeroCtps,
        serieCtps,
        pis,
        chavePix,
        cep,
        logradouro,
        numeroEndereco,
        complemento,
        bairro,
        cidade,
        estado
    };

    for (const [chave, valor] of Object.entries(camposOpcionais)) {
        if (valor !== undefined && valor !== null && valor !== '') {
            dados[chave] = valor;
        }
    }

    if (numeroDependentes !== undefined && numeroDependentes !== null && numeroDependentes !== '') {
        dados.numeroDependentes = Number(numeroDependentes);
    }

    if (valeTransporte !== undefined) {
        dados.valeTransporte = Boolean(valeTransporte);
    }
    if (valeAlimentacao !== undefined) {
        dados.valeAlimentacao = Boolean(valeAlimentacao);
    }
    if (planoSaude !== undefined) {
        dados.planoSaude = Boolean(planoSaude);
    }

    return dados;
}

const CAMPOS_DATA_FUNCIONARIO = ['birthDate', 'admissionDate', 'resignationDate', 'leaveReturnDate'];

/**
 * Converte strings de data (YYYY-MM-DD) em Date para persistência no Prisma.
 * @param {unknown} valor
 * @returns {Date | null}
 */
export function converterDataFuncionario(valor) {
    if (valor === null || valor === '') {
        return null;
    }

    if (valor instanceof Date) {
        return Number.isNaN(valor.getTime()) ? null : valor;
    }

    if (typeof valor === 'number') {
        const data = new Date(valor);
        return Number.isNaN(data.getTime()) ? null : data;
    }

    return parsearDataSomenteDia(valor);
}

/**
 * Normaliza apenas os campos de data presentes em uma atualização parcial.
 * @param {Record<string, unknown>} dadosAtualizacao
 * @returns {Record<string, unknown>}
 */
export function normalizarDatasAtualizacaoFuncionario(dadosAtualizacao) {
    const dados = { ...dadosAtualizacao };

    for (const campo of CAMPOS_DATA_FUNCIONARIO) {
        if (dados[campo] !== undefined) {
            dados[campo] = converterDataFuncionario(dados[campo]);
        }
    }

    return dados;
}
