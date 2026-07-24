/**
 * @param {object} entrada
 * @param {object} dadosObrigatoriosValidados
 */
export function montarDadosPersistenciaCadastroContratacao(entrada, dadosObrigatoriosValidados) {
    const dados = { ...dadosObrigatoriosValidados };

    if (typeof entrada.complemento === 'string' && entrada.complemento.trim()) {
        dados.complemento = entrada.complemento.trim();
    } else if (!dados.complemento) {
        dados.complemento = null;
    }

    return dados;
}
