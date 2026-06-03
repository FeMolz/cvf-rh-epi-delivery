/**
 * Headers de segurança HTTP básicos (sem dependência externa).
 * @returns {import('express').RequestHandler}
 */
export function configurarHelmet() {
    return (_requisicao, resposta, proximo) => {
        resposta.setHeader('X-Content-Type-Options', 'nosniff');
        resposta.setHeader('X-Frame-Options', 'DENY');
        resposta.setHeader('Referrer-Policy', 'no-referrer');
        resposta.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        resposta.setHeader('X-DNS-Prefetch-Control', 'off');
        return proximo();
    };
}
