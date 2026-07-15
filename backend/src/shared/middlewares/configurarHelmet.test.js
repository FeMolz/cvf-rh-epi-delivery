import { jest } from '@jest/globals';

describe('configurarHelmet', () => {
    const importarMiddleware = async (nodeEnv = 'development') => {
        jest.resetModules();
        jest.unstable_mockModule('../../config/env.js', () => ({
            default: { NODE_ENV: nodeEnv }
        }));
        const { configurarHelmet } = await import('./configurarHelmet.js');
        return configurarHelmet();
    };

    it('deve definir headers de segurança HTTP', async () => {
        const middleware = await importarMiddleware();
        const resposta = { setHeader: jest.fn() };
        const proximo = jest.fn();

        middleware({}, resposta, proximo);

        expect(resposta.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
        expect(resposta.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
        expect(resposta.setHeader).toHaveBeenCalledWith(
            'Referrer-Policy',
            'strict-origin-when-cross-origin'
        );
        expect(resposta.setHeader).toHaveBeenCalledWith(
            'Permissions-Policy',
            'geolocation=(), microphone=(), camera=()'
        );
        expect(resposta.setHeader).toHaveBeenCalledWith('X-DNS-Prefetch-Control', 'off');
        expect(resposta.setHeader).toHaveBeenCalledWith(
            'Content-Security-Policy',
            "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
        );
        expect(proximo).toHaveBeenCalledTimes(1);
    });

    it('deve incluir HSTS em produção', async () => {
        const middleware = await importarMiddleware('production');
        const resposta = { setHeader: jest.fn() };
        const proximo = jest.fn();

        middleware({}, resposta, proximo);

        expect(resposta.setHeader).toHaveBeenCalledWith(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains'
        );
    });
});
