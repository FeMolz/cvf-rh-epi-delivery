import { spawnSync } from 'node:child_process';

import { carregarAmbienteTeste, diretorioRaiz, arquivoEnvTeste } from './carregarAmbienteTeste.mjs';

function executarComando(comando, argumentos) {
    const resultado = spawnSync(comando, argumentos, {
        cwd: diretorioRaiz,
        stdio: 'inherit',
        shell: true,
        env: process.env
    });

    if (resultado.status !== 0) {
        process.exit(resultado.status ?? 1);
    }
}

const apenasSchema = process.argv.includes('--apenas-schema');

const urlBancoTeste = carregarAmbienteTeste();

process.env.RH_ENV_ARQUIVO = '.env.test';

console.log('Usando ambiente:', arquivoEnvTeste);

executarComando('npx', ['prisma', 'db', 'push', `--url=${urlBancoTeste}`]);
executarComando('npx', ['prisma', 'generate']);

if (apenasSchema) {
    console.log('Schema aplicado. Rode npm run db:test:seed para popular dados.');
    process.exit(0);
}

const seeders = [
    'prisma/seeders/admin.js',
    'prisma/seeders/seed_companies.js',
    'prisma/seeders/seed_setores.js',
    'prisma/seeders/seed_test_data.js'
];

for (const seedRelativo of seeders) {
    console.log('\n> Seed:', seedRelativo);
    executarComando('node', [seedRelativo]);
}

console.log('\nBanco de teste pronto. Execute: npm run dev:test');
