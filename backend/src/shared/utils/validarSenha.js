import {
    MENSAGEM_SENHA_FRACA,
    PADRAO_SENHA_FORTE,
    TAMANHO_MINIMO_SENHA
} from '../constants/segurancaConstantes.js';

/**
 * @param {string} senha
 * @throws {Error}
 */
export function validarPoliticaSenha(senha) {
    const textoSenha = typeof senha === 'string' ? senha : '';

    if (textoSenha.length < TAMANHO_MINIMO_SENHA || !PADRAO_SENHA_FORTE.test(textoSenha)) {
        throw new Error(MENSAGEM_SENHA_FRACA);
    }
}
