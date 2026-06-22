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
                  : resposta.status === 404
                    ? 'Recurso não encontrado na API. Reinicie o backend se o sistema foi atualizado recentemente.'
                    : 'Não foi possível concluir a operação.';

        const erro = new Error(mensagem);
        erro.statusCode = resposta.status;
        throw erro;
    }

    return dados;
}

/**
 * @param {string} caminho
 * @param {{ token?: string, nomeArquivoPadrao?: string }} [opcoes]
 */
export async function baixarArquivoApi(caminho, opcoes = {}) {
    const { token, nomeArquivoPadrao = 'download.xlsx' } = opcoes;

    /** @type {Record<string, string>} */
    const cabecalhos = {};

    if (token) {
        cabecalhos.Authorization = `Bearer ${token}`;
    }

    const resposta = await fetch(`${URL_BASE_API}${caminho}`, {
        headers: cabecalhos
    });

    if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        const mensagem =
            typeof dados.error === 'string'
                ? dados.error
                : typeof dados.message === 'string'
                  ? dados.message
                  : 'Não foi possível baixar o arquivo.';

        throw new Error(mensagem);
    }

    const blob = await resposta.blob();
    let nomeArquivo = nomeArquivoPadrao;
    const disposition = resposta.headers.get('Content-Disposition');

    if (disposition) {
        const correspondencia = disposition.match(/filename="?([^";\n]+)"?/);

        if (correspondencia?.[1]) {
            nomeArquivo = correspondencia[1];
        }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
