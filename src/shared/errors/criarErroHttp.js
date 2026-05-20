/**
 * @param {string} mensagem
 * @param {number} statusCode
 * @returns {Error}
 */
export function criarErroHttp(mensagem, statusCode = 400) {
    const erro = new Error(mensagem);
    erro.statusCode = statusCode;
    return erro;
}

/**
 * @param {string} [mensagem]
 * @returns {Error}
 */
export function criarErroNaoEncontrado(mensagem = 'Recurso não encontrado') {
    return criarErroHttp(mensagem, 404);
}
