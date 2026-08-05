import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as aguardar } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const diretorioRaiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const diretorioBackend = path.join(diretorioRaiz, 'backend');
const diretorioFrontend = path.join(diretorioRaiz, 'frontend');

/**
 * @param {string} comando
 * @param {import('node:child_process').ExecSyncOptions} [opcoes]
 */
function executar(comando, opcoes = {}) {
    try {
        execSync(comando, {
            cwd: diretorioRaiz,
            stdio: 'inherit',
            env: process.env,
            shell: true,
            ...opcoes
        });
    } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : String(erro);
        throw new Error(`[e2e] Comando falhou (${comando}): ${mensagem}`);
    }
}

export async function aguardarPostgresDisponivel() {
    if (!process.env.CI || !process.env.DATABASE_URL) {
        return;
    }

    const { default: pg } = await import('pg');
    const connectionString = process.env.DATABASE_URL;
    const timeoutMs = 60_000;
    const inicio = Date.now();

    while (Date.now() - inicio < timeoutMs) {
        const cliente = new pg.Client({ connectionString });

        try {
            await cliente.connect();
            await cliente.query('SELECT 1');
            await cliente.end();
            console.log('[e2e] Postgres do CI disponível.');
            return;
        } catch {
            await cliente.end().catch(() => {});
            await aguardar(2_000);
        }
    }

    throw new Error('Postgres do CI não ficou disponível a tempo.');
}

export async function garantirInfraestruturaTeste() {
    if (process.env.CI) {
        console.log('[e2e] CI detectado — usando Postgres do GitHub Actions (sem Docker local).');
        await aguardarPostgresDisponivel();
        return;
    }

    console.log('[e2e] Verificando containers de teste (Postgres/Redis)...');

    try {
        executar('docker compose -f docker-compose.test.yml up -d', {
            cwd: diretorioBackend
        });
        await aguardar(5_000);
    } catch (erro) {
        console.warn(
            '[e2e] Não foi possível subir docker-compose.test.yml automaticamente.',
            erro instanceof Error ? erro.message : erro
        );
    }
}

export function prepararAmbienteFrontendTeste() {
    const destino = path.join(diretorioFrontend, '.env.test');
    const exemplo = path.join(diretorioFrontend, '.env.test.example');

    if (!fs.existsSync(destino) && fs.existsSync(exemplo)) {
        fs.copyFileSync(exemplo, destino);
        console.log('[e2e] frontend/.env.test criado a partir do exemplo.');
    }
}

export function prepararBancoTeste() {
    if (process.env.E2E_SKIP_DB_PREPARE === 'true') {
        console.log('[e2e] Preparação de banco pulada (E2E_SKIP_DB_PREPARE=true).');
        return;
    }

    executar('npm run db:test:push -w backend');
    executar('npm run seed:all:test -w backend');
}
