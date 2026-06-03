import { jest } from '@jest/globals';
import { configurarHelmet } from './configurarHelmet.js';

describe('configurarHelmet', () => {
    it('deve definir headers de segurança HTTP', () => {
        const middleware = configurarHelmet();
        const resposta = { setHeader: jest.fn() };
        const proximo = jest.fn();

        middleware({}, resposta, proximo);

        expect(resposta.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
        expect(resposta.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
        expect(resposta.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'no-referrer');
        expect(proximo).toHaveBeenCalledTimes(1);
    });
});
