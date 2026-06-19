import { spawnSync } from 'node:child_process';

import { carregarAmbienteTeste, diretorioRaiz } from './carregarAmbienteTeste.mjs';

const argumentos = process.argv.slice(2);

if (argumentos.length === 0) {
    console.error('Uso: node prisma/scripts/executar-com-ambiente-teste.mjs <arquivo.js> [args...]');
    process.exit(1);
}

carregarAmbienteTeste();
process.env.RH_ENV_ARQUIVO = '.env.test';

const resultado = spawnSync('node', argumentos, {
    cwd: diretorioRaiz,
    stdio: 'inherit',
    shell: true,
    env: process.env
});

process.exit(resultado.status ?? 1);
