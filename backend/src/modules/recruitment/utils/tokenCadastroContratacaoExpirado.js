import env from '../../../config/env.js';

/**
 * @param {Date|string} criadoEm
 * @param {Date} [referencia]
 * @returns {boolean}
 */
export function tokenCadastroContratacaoExpirado(criadoEm, referencia = new Date()) {
    if (!criadoEm) {
        return true;
    }

    const dataCriacao = criadoEm instanceof Date ? criadoEm : new Date(criadoEm);
    const dataExpiracao = new Date(dataCriacao);
    dataExpiracao.setDate(dataExpiracao.getDate() + env.TOKEN_CADASTRO_VALIDADE_DIAS);

    return referencia > dataExpiracao;
}
