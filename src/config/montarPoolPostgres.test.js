import { montarConfiguracaoPoolPostgres } from './montarPoolPostgres.js';

describe('montarConfiguracaoPoolPostgres', () => {
    it('deve habilitar SSL para host Supabase', () => {
        const configuracao = montarConfiguracaoPoolPostgres(
            'postgresql://user:pass@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
        );

        expect(configuracao.ssl).toEqual({ rejectUnauthorized: false });
        expect(configuracao.max).toBe(10);
    });

    it('deve manter configuração simples para PostgreSQL local', () => {
        const configuracao = montarConfiguracaoPoolPostgres(
            'postgresql://postgres:admin@localhost:5433/rh_system?schema=public'
        );

        expect(configuracao.ssl).toBeUndefined();
        expect(configuracao.max).toBeUndefined();
    });
});
