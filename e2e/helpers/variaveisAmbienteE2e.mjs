/**
 * Variáveis que o webServer E2E precisa herdar explicitamente no CI.
 * @param {NodeJS.ProcessEnv} [origem]
 */
export function montarVariaveisAmbienteE2e(origem = process.env) {
    return {
        ...origem,
        CI: origem.CI || 'true',
        NODE_ENV: origem.NODE_ENV || 'test',
        PORT: origem.PORT || '3001',
        RH_API_PORT: origem.RH_API_PORT || origem.PORT || '3001',
        JWT_SECRET: origem.JWT_SECRET,
        ADMIN_SEED_PASSWORD: origem.ADMIN_SEED_PASSWORD,
        DATABASE_URL: origem.DATABASE_URL,
        REDIS_URL: origem.REDIS_URL ?? '',
        SUPABASE_URL: origem.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: origem.SUPABASE_SERVICE_ROLE_KEY,
        SUPABASE_STORAGE_BUCKET_EPI_REPORTS: origem.SUPABASE_STORAGE_BUCKET_EPI_REPORTS,
        PUPPETEER_EXECUTABLE_PATH: origem.PUPPETEER_EXECUTABLE_PATH
    };
}
