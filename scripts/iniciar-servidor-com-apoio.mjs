import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const diretorioRaiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const resultadoApoio = spawnSync('node', ['scripts/iniciar-apoio-docker.mjs'], {
    cwd: diretorioRaiz,
    stdio: 'inherit',
    shell: true
});

if (resultadoApoio.status !== 0) {
    process.exit(resultadoApoio.status ?? 1);
}

const resultadoServidor = spawnSync('node', ['src/server.js'], {
    cwd: diretorioRaiz,
    stdio: 'inherit',
    shell: true,
    env: process.env
});

process.exit(resultadoServidor.status ?? 1);
