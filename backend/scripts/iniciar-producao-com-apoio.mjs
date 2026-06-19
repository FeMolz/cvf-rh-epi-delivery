import { spawnSync } from 'node:child_process';

import { carregarAmbienteProducao, diretorioRaiz } from '../prisma/scripts/carregarAmbienteProducao.mjs';

carregarAmbienteProducao();

const resultadoApoio = spawnSync('node', ['scripts/iniciar-apoio-docker.mjs'], {
    cwd: diretorioRaiz,
    stdio: 'inherit',
    shell: true,
    env: process.env
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
