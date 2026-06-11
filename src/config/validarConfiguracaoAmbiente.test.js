import {
    validarOrigensCorsProducao,
    validarRedisProducao,
    validarSegredoJwt
} from './validarConfiguracaoAmbiente.js';

describe('validarConfiguracaoAmbiente', () => {
    it('deve exigir JWT_SECRET definido', () => {
        expect(() => validarSegredoJwt(undefined, 'test')).toThrow('JWT_SECRET não definida');
    });

    it('deve exigir tamanho mínimo do JWT em produção', () => {
        expect(() => validarSegredoJwt('curto', 'production')).toThrow('32 caracteres');
    });

    it('deve exigir REDIS_URL em produção', () => {
        expect(() => validarRedisProducao(undefined, 'production')).toThrow('REDIS_URL');
    });

    it('deve exigir CORS explícito em produção', () => {
        expect(() => validarOrigensCorsProducao(undefined, 'production')).toThrow('CORS_ORIGINS');
        expect(() => validarOrigensCorsProducao('*', 'production')).toThrow('CORS_ORIGINS');
    });

    it('deve aceitar configuração válida', () => {
        expect(() => validarSegredoJwt('segredo-teste-local-16', 'test')).not.toThrow();
        expect(() =>
            validarOrigensCorsProducao('https://app.empresa.com', 'production')
        ).not.toThrow();
    });
});
