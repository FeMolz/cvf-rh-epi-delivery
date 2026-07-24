import {
    exigirVariavelDefinida,
    validarCaepiProducao,
    validarMailProducao,
    validarOrigensCorsProducao,
    validarRedisProducao,
    validarSegredoJwt,
    validarSupabaseStorageProducao
} from './validarConfiguracaoAmbiente.js';

describe('validarConfiguracaoAmbiente', () => {
    it('deve exigir JWT_SECRET definido', () => {
        expect(() => validarSegredoJwt(undefined, 'test')).toThrow('JWT_SECRET não definida');
        expect(() => validarSegredoJwt('   ', 'test')).toThrow('JWT_SECRET não definida');
    });

    it('deve exigir variável com valor não vazio via exigirVariavelDefinida', () => {
        expect(() => exigirVariavelDefinida('DATABASE_URL', '')).toThrow(
            'DATABASE_URL não definida nas variáveis de ambiente.'
        );
        expect(() => exigirVariavelDefinida('DATABASE_URL', '  ')).toThrow(
            'DATABASE_URL não definida nas variáveis de ambiente.'
        );
    });

    it('deve exigir tamanho mínimo do JWT em produção', () => {
        expect(() => validarSegredoJwt('curto', 'production')).toThrow('32 caracteres');
    });

    it('deve exigir tamanho mínimo do JWT em desenvolvimento', () => {
        expect(() => validarSegredoJwt('curto-dev', 'development')).toThrow('16 caracteres');
    });

    it('deve exigir REDIS_URL em produção', () => {
        expect(() => validarRedisProducao(undefined, 'production')).toThrow('REDIS_URL');
        expect(() => validarRedisProducao('   ', 'production')).toThrow('REDIS_URL');
    });

    it('deve ignorar REDIS_URL fora de produção', () => {
        expect(() => validarRedisProducao(undefined, 'development')).not.toThrow();
    });

    it('deve exigir CAEPI_API_URL em produção', () => {
        expect(() => validarCaepiProducao(undefined, 'production')).toThrow('CAEPI_API_URL');
        expect(() => validarCaepiProducao('   ', 'production')).toThrow('CAEPI_API_URL');
    });

    it('deve ignorar CAEPI_API_URL fora de produção', () => {
        expect(() => validarCaepiProducao(undefined, 'development')).not.toThrow();
    });

    it('deve exigir CORS explícito em produção', () => {
        expect(() => validarOrigensCorsProducao(undefined, 'production')).toThrow('CORS_ORIGINS');
        expect(() => validarOrigensCorsProducao('*', 'production')).toThrow('CORS_ORIGINS');
        expect(() => validarOrigensCorsProducao('   ', 'production')).toThrow('CORS_ORIGINS');
    });

    it('deve ignorar CORS fora de produção', () => {
        expect(() => validarOrigensCorsProducao(undefined, 'development')).not.toThrow();
        expect(() => validarOrigensCorsProducao('*', 'development')).not.toThrow();
    });

    it('deve exigir SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em produção', () => {
        expect(() => validarSupabaseStorageProducao(undefined, 'chave', 'production')).toThrow(
            'SUPABASE_URL'
        );
        expect(() => validarSupabaseStorageProducao('https://projeto.supabase.co', '   ', 'production')).toThrow(
            'SUPABASE_SERVICE_ROLE_KEY'
        );
    });

    it('deve ignorar Supabase Storage fora de produção', () => {
        expect(() => validarSupabaseStorageProducao(undefined, undefined, 'development')).not.toThrow();
    });

    it('deve exigir GMAIL e FRONTEND_PUBLIC_URL em produção', () => {
        expect(() => validarMailProducao(undefined, 'pass', 'http://app', 'production')).toThrow(
            'GMAIL_USER'
        );
        expect(() => validarMailProducao('user@gmail.com', '  ', 'http://app', 'production')).toThrow(
            'GMAIL_PASS'
        );
        expect(() =>
            validarMailProducao('user@gmail.com', 'pass', undefined, 'production')
        ).toThrow('FRONTEND_PUBLIC_URL');
    });

    it('deve ignorar mail fora de produção', () => {
        expect(() => validarMailProducao(undefined, undefined, undefined, 'development')).not.toThrow();
    });

    it('deve aceitar configuração válida', () => {
        expect(() => validarSegredoJwt('segredo-teste-local-16', 'test')).not.toThrow();
        expect(() =>
            validarOrigensCorsProducao('https://app.empresa.com', 'production')
        ).not.toThrow();
        expect(() => validarRedisProducao('redis://localhost:6379', 'production')).not.toThrow();
        expect(() => validarCaepiProducao('http://localhost:8080', 'production')).not.toThrow();
        expect(() =>
            validarSupabaseStorageProducao('https://projeto.supabase.co', 'service-role-key', 'production')
        ).not.toThrow();
        expect(() =>
            validarMailProducao('rh@gmail.com', 'senha-app', 'https://app.empresa.com', 'production')
        ).not.toThrow();
    });
});
