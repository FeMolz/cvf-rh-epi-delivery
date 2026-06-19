import env from '../../config/env.js';
import { obterClienteRedis } from '../providers/redis/obterClienteRedis.js';
import { criarLimitadorTaxaMemoria } from './criarLimitadorTaxaMemoria.js';

const JANELA_PADRAO_MS = 15 * 60 * 1000;

/**
 * @param {{
 *   janelaMs?: number,
 *   limiteRequisicoes?: number,
 *   mensagem?: string,
 *   prefixoChave?: string
 * }} opcoes
 * @returns {import('express').RequestHandler}
 */
export function criarLimitadorTaxa(opcoes = {}) {
    const janelaMs = opcoes.janelaMs ?? JANELA_PADRAO_MS;
    const limiteRequisicoes = opcoes.limiteRequisicoes ?? 100;
    const mensagem = opcoes.mensagem ?? 'Muitas requisições. Tente novamente mais tarde.';
    const prefixoChave = opcoes.prefixoChave ?? 'geral';

    const limitadorMemoria = criarLimitadorTaxaMemoria({
        janelaMs,
        limiteRequisicoes,
        mensagem,
        prefixoChave
    });

    return async (requisicao, resposta, proximo) => {
        const clienteRedis = obterClienteRedis();

        if (!clienteRedis) {
            return limitadorMemoria(requisicao, resposta, proximo);
        }

        const chaveRedis = `rate-limit:${prefixoChave}:${requisicao.ip}:${requisicao.path}`;

        try {
            if (clienteRedis.status !== 'ready') {
                await clienteRedis.connect();
            }

            const contagem = await clienteRedis.incr(chaveRedis);

            if (contagem === 1) {
                await clienteRedis.pexpire(chaveRedis, janelaMs);
            }

            if (contagem > limiteRequisicoes) {
                return resposta.status(429).json({
                    status: 'error',
                    message: mensagem
                });
            }

            return proximo();
        } catch {
            return limitadorMemoria(requisicao, resposta, proximo);
        }
    };
}

export const limitadorTaxaLogin = criarLimitadorTaxa({
    janelaMs: JANELA_PADRAO_MS,
    limiteRequisicoes: env.RATE_LIMIT_LOGIN_MAX,
    prefixoChave: 'login',
    mensagem: 'Muitas tentativas de login. Aguarde e tente novamente.'
});

export const limitadorTaxaRotasPublicas = criarLimitadorTaxa({
    janelaMs: JANELA_PADRAO_MS,
    limiteRequisicoes: env.RATE_LIMIT_PUBLICO_MAX,
    prefixoChave: 'publico',
    mensagem: 'Muitas requisições neste endpoint público. Tente novamente mais tarde.'
});

export const limitadorTaxaGlobal = criarLimitadorTaxa({
    janelaMs: JANELA_PADRAO_MS,
    limiteRequisicoes: env.RATE_LIMIT_GLOBAL_MAX,
    prefixoChave: 'global',
    mensagem: 'Muitas requisições. Tente novamente mais tarde.'
});
