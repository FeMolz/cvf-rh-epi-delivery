const armazenamentoRequisicoes = new Map();

/**
 * @param {{
 *   janelaMs?: number,
 *   limiteRequisicoes?: number,
 *   mensagem?: string,
 *   prefixoChave?: string
 * }} opcoes
 * @returns {import('express').RequestHandler}
 */
export function criarLimitadorTaxaMemoria(opcoes = {}) {
    const janelaMs = opcoes.janelaMs ?? 15 * 60 * 1000;
    const limiteRequisicoes = opcoes.limiteRequisicoes ?? 100;
    const mensagem = opcoes.mensagem ?? 'Muitas requisições. Tente novamente mais tarde.';
    const prefixoChave = opcoes.prefixoChave ?? 'geral';

    return (requisicao, resposta, proximo) => {
        const chave = `${prefixoChave}:${requisicao.ip}:${requisicao.path}`;
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
