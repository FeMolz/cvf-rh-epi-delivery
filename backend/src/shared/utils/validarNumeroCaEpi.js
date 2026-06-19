import { MENSAGEM_NUMERO_CA_INVALIDO } from '../constants/segurancaConstantes.js';

const PADRAO_NUMERO_CA = /^\d{1,20}$/;

/**
 * @param {string|number} numeroCa
 * @returns {string}
 */
export function validarNumeroCaEpi(numeroCa) {
    const textoNumero = String(numeroCa ?? '').trim();

    if (!PADRAO_NUMERO_CA.test(textoNumero)) {
        throw new Error(MENSAGEM_NUMERO_CA_INVALIDO);
    }

    return textoNumero;
}
