import pg from 'pg';

const HOST_SUPABASE = 'supabase.com';
const LIMITE_CONEXOES_POOL_SUPABASE = 10;

/**
 * @param {string} connectionString
 * @returns {import('pg').PoolConfig}
 */
export function montarConfiguracaoPoolPostgres(connectionString) {
    const conexaoSupabase = connectionString.includes(HOST_SUPABASE);

    const configuracao = {
        connectionString
    };

    if (conexaoSupabase) {
        configuracao.ssl = { rejectUnauthorized: false };
        configuracao.max = LIMITE_CONEXOES_POOL_SUPABASE;
    }

    return configuracao;
}

/**
 * @param {string} connectionString
 * @returns {import('pg').Pool}
 */
export function criarPoolPostgres(connectionString) {
    return new pg.Pool(montarConfiguracaoPoolPostgres(connectionString));
}
