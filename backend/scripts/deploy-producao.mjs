import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { carregarAmbienteProducao } from '../prisma/scripts/carregarAmbienteProducao.mjs';

const diretorioBackend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const diretorioMonorepo = path.resolve(diretorioBackend, '..');

carregarAmbienteProducao();

/**
 * @param {string} comando
 * @param {string[]} argumentos
 * @param {string} [diretorioTrabalho]
 */
function executar(comando, argumentos, diretorioTrabalho = diretorioBackend) {
    console.log(`[deploy] ${comando} ${argumentos.join(' ')}`);

    const resultado = spawnSync(comando, argumentos, {
        cwd: diretorioTrabalho,
        stdio: 'inherit',
        shell: true
    });

    if (resultado.status !== 0) {
        console.error(`[deploy] Falha: ${comando}`);
        process.exit(resultado.status ?? 1);
    }
}

console.log('[deploy] Iniciando deploy de produção...');

executar('git', ['fetch', 'origin', 'main'], diretorioMonorepo);
executar('git', ['reset', '--hard', 'origin/main'], diretorioMonorepo);
executar('npm', ['ci', '--omit=dev'], diretorioMonorepo);
executar('npx', ['prisma', 'generate']);
executar('npm', ['run', 'db:prod:migrate']);
executar('docker', ['compose', '-f', 'docker-compose.producao.yml', 'up', '-d', '--build']);

console.log('[deploy] Aguardando API responder...');
await new Promise((resolver) => {
    setTimeout(resolver, 8_000);
});

const cabecalhos = {};

if (process.env.HEALTH_CHECK_TOKEN) {
    cabecalhos['X-Health-Token'] = process.env.HEALTH_CHECK_TOKEN;
}

const resposta = await fetch('http://127.0.0.1:3000/health', { headers: cabecalhos });

if (!resposta.ok) {
    console.error('[deploy] Health check falhou com status', resposta.status);
    process.exit(1);
}

const corpo = await resposta.json();
console.log('[deploy] Health:', JSON.stringify(corpo));

if (corpo.status !== 'OK' || corpo.database !== 'OK') {
    console.error('[deploy] Health check retornou estado inesperado');
    process.exit(1);
}

console.log('[deploy] Concluído com sucesso.');
