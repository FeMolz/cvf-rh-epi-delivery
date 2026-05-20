import { MENSAGEM_EMAIL_INVALIDO } from '../constants/funcionarioConstantes.js';

const PADRAO_EMAIL = /^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/;
const TAMANHO_MAXIMO_EMAIL = 254;

/**
 * @param {unknown} email
 * @returns {string}
 */
export function validarEmail(email) {
    const emailNormalizado = String(email).trim().toLowerCase();

    if (
        emailNormalizado.length === 0 ||
        emailNormalizado.length > TAMANHO_MAXIMO_EMAIL ||
        !PADRAO_EMAIL.test(emailNormalizado)
    ) {
        throw new Error(MENSAGEM_EMAIL_INVALIDO);
    }

    return emailNormalizado;
}
