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
    execSync(comando, {
        cwd: diretorioRaiz,
        stdio: 'inherit',
        env: process.env,
        shell: true,
        ...opcoes
    });
}

export async function garantirInfraestruturaTeste() {
    if (process.env.CI) {
        console.log('[e2e] CI detectado — usando Postgres do GitHub Actions (sem Docker local).');
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
    executar('npm run db:test:push -w backend');
    executar('npm run seed:all:test -w backend');
}
