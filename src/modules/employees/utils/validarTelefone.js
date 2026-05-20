import { MENSAGEM_TELEFONE_INVALIDO } from '../constants/funcionarioConstantes.js';

const PADRAO_TELEFONE_CELULAR = /^\(\d{2}\) \d{5}-\d{4}$/;
const PADRAO_TELEFONE_FIXO = /^\(\d{2}\) \d{4}-\d{4}$/;

/**
 * @param {unknown} telefone
 * @returns {string}
 */
export function validarTelefone(telefone) {
    const telefoneInformado = String(telefone).trim();

    if (
        !PADRAO_TELEFONE_CELULAR.test(telefoneInformado) &&
        !PADRAO_TELEFONE_FIXO.test(telefoneInformado)
    ) {
        throw new Error(MENSAGEM_TELEFONE_INVALIDO);
    }

    return telefoneInformado;
}
