import env from '../../config/env.js';

const MENSAGEM_HEALTH_NAO_AUTORIZADO = 'Acesso ao health check não autorizado.';

/**
 * Em produção exige header X-Health-Token quando HEALTH_CHECK_TOKEN estiver definido.
 * @returns {import('express').RequestHandler}
 */
export function protegerHealthCheck() {
    return (requisicao, resposta, proximo) => {
        if (env.NODE_ENV !== 'production' || !env.HEALTH_CHECK_TOKEN) {
            return proximo();
        }

        const tokenInformado = requisicao.headers['x-health-token'];

        if (tokenInformado === env.HEALTH_CHECK_TOKEN) {
            return proximo();
        }

        return resposta.status(401).json({
            status: 'error',
            message: MENSAGEM_HEALTH_NAO_AUTORIZADO
        });
    };
}
