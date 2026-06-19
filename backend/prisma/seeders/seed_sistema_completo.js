import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import './carregarAmbienteRaiz.js';

const diretorioSeeders = path.dirname(fileURLToPath(import.meta.url));

const ordemSeeders = [
    'admin.js',
    'seed_companies.js',
    'seed_setores.js',
    'seed_usuarios_papeis.js',
    'seed_cargos.js',
    'seed_funcionarios.js',
    'seed_epis_locais.js',
    'seed_quesitos.js',
    'seed_entregas_epi.js',
    'seed_recrutamento.js',
    'seed_auditoria.js'
];

function executarSeed(nomeArquivo) {
    const caminhoSeed = path.join(diretorioSeeders, nomeArquivo);
    console.log(`\n> Seed: ${nomeArquivo}`);

    const resultado = spawnSync('node', [caminhoSeed], {
        cwd: path.resolve(diretorioSeeders, '../..'),
        stdio: 'inherit',
        shell: true,
        env: process.env
    });

    if (resultado.status !== 0) {
        process.exit(resultado.status ?? 1);
    }
}

console.log('=== SEED COMPLETO DO SISTEMA ===');

for (const nomeSeed of ordemSeeders) {
    executarSeed(nomeSeed);
}

console.log('\n=== TODOS OS MÓDULOS FORAM POPULADOS ===');
console.log('Opcional: node prisma/scripts/executar-com-ambiente-teste.mjs prisma/seeders/seed_epis.js');
console.log('(requer CAEPI_API_URL para buscar CAs reais na API externa)');
