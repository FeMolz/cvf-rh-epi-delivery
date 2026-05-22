import { MENSAGEM_EMAIL_INVALIDO } from '../constants/recrutamentoConstantes.js';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {string} email
 */
export function validarEmailCandidato(email) {
    if (!REGEX_EMAIL.test(email)) {
        throw new Error(MENSAGEM_EMAIL_INVALIDO);
    }
}
