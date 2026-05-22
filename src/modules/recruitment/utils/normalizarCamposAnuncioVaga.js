import {
    MENSAGEM_APRESENTACAO_EMPRESA_OBRIGATORIA,
    MENSAGEM_BENEFICIOS_OBRIGATORIOS,
    MENSAGEM_JORNADA_TRABALHO_OBRIGATORIA,
    MENSAGEM_LOCAL_TRABALHO_OBRIGATORIO,
    MENSAGEM_REQUISITOS_OBRIGATORIOS,
    MENSAGEM_RESPONSABILIDADES_OBRIGATORIAS,
    MENSAGEM_SOBRE_VAGA_OBRIGATORIA,
    MENSAGEM_COMPANY_ID_OBRIGATORIO,
    MENSAGEM_ROLE_ID_OBRIGATORIO,
    MENSAGEM_SETOR_ID_OBRIGATORIO,
    MENSAGEM_TIPO_CONTRATACAO_INVALIDO,
    MENSAGEM_TITULO_VAGA_OBRIGATORIO,
    TIPOS_CONTRATACAO_VAGA
} from '../constants/recrutamentoConstantes.js';

/**
 * @param {object} entrada
 * @param {{ obrigatorio: boolean }} opcoes
 */
export function normalizarCamposAnuncioVaga(entrada, opcoes = { obrigatorio: true }) {
    const tituloVaga = typeof entrada.tituloVaga === 'string' ? entrada.tituloVaga.trim() : '';
    const apresentacaoEmpresa =
        typeof entrada.apresentacaoEmpresa === 'string' ? entrada.apresentacaoEmpresa.trim() : '';
    const sobreVaga = typeof entrada.sobreVaga === 'string' ? entrada.sobreVaga.trim() : '';
    const responsabilidades =
        typeof entrada.responsabilidades === 'string' ? entrada.responsabilidades.trim() : '';
    const requisitos = typeof entrada.requisitos === 'string' ? entrada.requisitos.trim() : '';
    const beneficios = typeof entrada.beneficios === 'string' ? entrada.beneficios.trim() : '';
    const localTrabalho = typeof entrada.localTrabalho === 'string' ? entrada.localTrabalho.trim() : '';
    const jornadaTrabalho =
        typeof entrada.jornadaTrabalho === 'string' ? entrada.jornadaTrabalho.trim() : '';
    const faixaSalarial =
        typeof entrada.faixaSalarial === 'string' && entrada.faixaSalarial.trim()
            ? entrada.faixaSalarial.trim()
            : null;
    const tipoContratacao =
        typeof entrada.tipoContratacao === 'string' ? entrada.tipoContratacao.trim().toUpperCase() : '';
    const roleId = typeof entrada.roleId === 'string' ? entrada.roleId.trim() : '';
    const companyId = typeof entrada.companyId === 'string' ? entrada.companyId.trim() : '';
    const setorId = typeof entrada.setorId === 'string' ? entrada.setorId.trim() : '';

    if (opcoes.obrigatorio) {
        if (!tituloVaga) throw new Error(MENSAGEM_TITULO_VAGA_OBRIGATORIO);
        if (!apresentacaoEmpresa) throw new Error(MENSAGEM_APRESENTACAO_EMPRESA_OBRIGATORIA);
        if (!sobreVaga) throw new Error(MENSAGEM_SOBRE_VAGA_OBRIGATORIA);
        if (!responsabilidades) throw new Error(MENSAGEM_RESPONSABILIDADES_OBRIGATORIAS);
        if (!requisitos) throw new Error(MENSAGEM_REQUISITOS_OBRIGATORIOS);
        if (!beneficios) throw new Error(MENSAGEM_BENEFICIOS_OBRIGATORIOS);
        if (!localTrabalho) throw new Error(MENSAGEM_LOCAL_TRABALHO_OBRIGATORIO);
        if (!jornadaTrabalho) throw new Error(MENSAGEM_JORNADA_TRABALHO_OBRIGATORIA);
        if (!tipoContratacao) throw new Error(MENSAGEM_TIPO_CONTRATACAO_INVALIDO);
        if (!roleId) throw new Error(MENSAGEM_ROLE_ID_OBRIGATORIO);
        if (!companyId) throw new Error(MENSAGEM_COMPANY_ID_OBRIGATORIO);
        if (!setorId) throw new Error(MENSAGEM_SETOR_ID_OBRIGATORIO);
    }

    if (tipoContratacao && !Object.values(TIPOS_CONTRATACAO_VAGA).includes(tipoContratacao)) {
        throw new Error(MENSAGEM_TIPO_CONTRATACAO_INVALIDO);
    }

    return {
        tituloVaga,
        apresentacaoEmpresa,
        sobreVaga,
        responsabilidades,
        requisitos,
        beneficios,
        localTrabalho,
        jornadaTrabalho,
        faixaSalarial,
        tipoContratacao,
        roleId,
        companyId,
        setorId
    };
}
