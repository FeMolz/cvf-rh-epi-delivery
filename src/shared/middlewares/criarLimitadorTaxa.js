const armazenamentoRequisicoes = new Map();

/**
 * @param {{
 *   janelaMs?: number,
 *   limiteRequisicoes?: number,
 *   mensagem?: string
 * }} opcoes
 * @returns {import('express').RequestHandler}
 */
export function criarLimitadorTaxa(opcoes = {}) {
    const janelaMs = opcoes.janelaMs ?? 15 * 60 * 1000;
    const limiteRequisicoes = opcoes.limiteRequisicoes ?? 100;
    const mensagem = opcoes.mensagem ?? 'Muitas requisições. Tente novamente mais tarde.';

    return (requisicao, resposta, proximo) => {
        const chave = `${requisicao.ip}:${requisicao.path}`;
        const agora = Date.now();
        const registro = armazenamentoRequisicoes.get(chave);

        if (!registro || agora > registro.reiniciaEm) {
            armazenamentoRequisicoes.set(chave, {
                contagem: 1,
                reiniciaEm: agora + janelaMs
            });
            return proximo();
        }

        if (registro.contagem >= limiteRequisicoes) {
            return resposta.status(429).json({
                status: 'error',
                message: mensagem
            });
        }

        registro.contagem += 1;
        armazenamentoRequisicoes.set(chave, registro);
        return proximo();
    };
}

export const limitadorTaxaLogin = criarLimitadorTaxa({
    janelaMs: 15 * 60 * 1000,
    limiteRequisicoes: Number(process.env.RATE_LIMIT_LOGIN_MAX) || 20,
    mensagem: 'Muitas tentativas de login. Aguarde e tente novamente.'
});

export const limitadorTaxaRotasPublicas = criarLimitadorTaxa({
    janelaMs: 15 * 60 * 1000,
    limiteRequisicoes: Number(process.env.RATE_LIMIT_PUBLICO_MAX) || 60,
    mensagem: 'Muitas requisições neste endpoint público. Tente novamente mais tarde.'
});

export const limitadorTaxaGlobal = criarLimitadorTaxa({
    janelaMs: 15 * 60 * 1000,
    limiteRequisicoes: Number(process.env.RATE_LIMIT_GLOBAL_MAX) || 300,
    mensagem: 'Muitas requisições. Tente novamente mais tarde.'
});
