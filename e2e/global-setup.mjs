import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const diretorioRaiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default async function globalSetup() {
    console.log('\n[e2e] Preparando banco de teste e seeds...');

    execSync('npm run db:test:push -w backend', {
        cwd: diretorioRaiz,
        stdio: 'inherit',
        env: process.env
    });

    execSync('npm run seed:all:test -w backend', {
        cwd: diretorioRaiz,
        stdio: 'inherit',
        env: process.env
    });

    console.log('[e2e] Ambiente de dados pronto.\n');
}
