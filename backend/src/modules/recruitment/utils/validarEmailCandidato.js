import { MENSAGEM_EMAIL_INVALIDO } from '../constants/recrutamentoConstantes.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {string} email
 */
export function validarEmailCandidato(email) {
    if (!REGEX_EMAIL.test(email)) {
        lancarErroRecrutamento(MENSAGEM_EMAIL_INVALIDO);
    }
}
