/**
 * Preparação de banco/seeds ocorre em scripts/servidor-e2e.mjs (webServer),
 * antes do backend subir — necessário no CI com Postgres vazio.
 */
export default async function globalSetup() {
    console.log('\n[e2e] Global setup: dados serão preparados pelo servidor E2E.\n');
}
