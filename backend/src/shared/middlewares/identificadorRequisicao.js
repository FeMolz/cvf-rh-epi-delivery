import { randomUUID } from 'node:crypto';

/**
 * @returns {import('express').RequestHandler}
 */
export function identificadorRequisicao() {
    return (requisicao, resposta, proximo) => {
        const identificador =
            typeof requisicao.headers['x-request-id'] === 'string'
                ? requisicao.headers['x-request-id']
                : randomUUID();

        requisicao.idRequisicao = identificador;
        resposta.setHeader('X-Request-Id', identificador);
        return proximo();
    };
}
