import env from '../../config/env.js';

/**
 * Headers de segurança HTTP básicos (sem dependência externa).
 * @returns {import('express').RequestHandler}
 */
export function configurarHelmet() {
    return (_requisicao, resposta, proximo) => {
        resposta.setHeader('X-Content-Type-Options', 'nosniff');
        resposta.setHeader('X-Frame-Options', 'DENY');
        resposta.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        resposta.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        resposta.setHeader('X-DNS-Prefetch-Control', 'off');
        resposta.setHeader(
            'Content-Security-Policy',
            "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
        );

        if (env.NODE_ENV === 'production') {
            resposta.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return proximo();
    };
}
