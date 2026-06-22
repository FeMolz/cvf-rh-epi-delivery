import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const diretorioRaiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

dotenv.config({ path: path.join(diretorioRaiz, '.env') });
dotenv.config({ path: path.join(diretorioRaiz, '.env.production.local'), override: false });

function removerContainerCaepiLegadoNaPorta8080() {
    const containersLegados = ['ca_api_epi'];

    for (const nomeContainer of containersLegados) {
        spawnSync('docker', ['rm', '-f', nomeContainer], {
            cwd: diretorioRaiz,
            stdio: 'pipe',
            shell: true
        });
    }
}

function executarDockerCompose() {
    removerContainerCaepiLegadoNaPorta8080();

    const resultado = spawnSync('docker', ['compose', '-f', 'docker-compose.apoio.yml', 'up', '-d', '--build'], {
        cwd: diretorioRaiz,
        stdio: 'inherit',
        shell: true
    });

    if (resultado.status !== 0) {
        console.error('[apoio] Falha ao subir docker-compose.apoio.yml');
        process.exit(resultado.status ?? 1);
    }
}

executarDockerCompose();

const { aguardarCaepiDisponivel } = await import('../src/config/aguardarCaepiInicializacao.js');

await aguardarCaepiDisponivel(process.env.CAEPI_API_URL);

console.log('[apoio] Redis e API baseCAEPI prontos.');
