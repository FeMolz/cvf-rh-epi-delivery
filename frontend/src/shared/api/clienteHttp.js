const URL_BASE_API = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * @param {string} caminho
 * @param {{ method?: string, body?: unknown, token?: string }} [opcoes]
 */
export async function requisicaoApi(caminho, opcoes = {}) {
    const { method = 'GET', body, token } = opcoes;

    /** @type {Record<string, string>} */
    const cabecalhos = {
        'Content-Type': 'application/json'
    };

    if (token) {
        cabecalhos.Authorization = `Bearer ${token}`;
    }

    const resposta = await fetch(`${URL_BASE_API}${caminho}`, {
        method,
        headers: cabecalhos,
        body: body !== undefined ? JSON.stringify(body) : undefined
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        const mensagem =
            typeof dados.error === 'string'
                ? dados.error
                : typeof dados.message === 'string'
                  ? dados.message
                  : 'Não foi possível concluir a operação.';

        throw new Error(mensagem);
    }

    return dados;
}
