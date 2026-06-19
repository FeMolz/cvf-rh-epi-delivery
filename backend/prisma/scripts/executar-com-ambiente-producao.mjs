import { spawnSync } from 'node:child_process';

import { carregarAmbienteProducao, diretorioRaiz } from './carregarAmbienteProducao.mjs';

const argumentos = process.argv.slice(2);

if (argumentos.length === 0) {
    console.error('Uso: node prisma/scripts/executar-com-ambiente-producao.mjs <comando> [args...]');
    process.exit(1);
}

carregarAmbienteProducao();

const [comando, ...parametros] = argumentos;

const resultado = spawnSync(comando, parametros, {
    cwd: diretorioRaiz,
    stdio: 'inherit',
    shell: true,
    env: process.env
});

process.exit(resultado.status ?? 1);
