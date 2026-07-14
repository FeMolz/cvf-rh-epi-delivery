import { spawnSync } from 'node:child_process';

import { carregarAmbienteTeste, diretorioRaiz } from './carregarAmbienteTeste.mjs';

carregarAmbienteTeste();
process.env.RH_ENV_ARQUIVO = '.env.test';
process.env.RUN_INTEGRATION_TESTS = 'true';

const resultado = spawnSync(
    'node',
    [
        '--experimental-vm-modules',
        '../node_modules/jest/bin/jest.js',
        '--testPathPatterns',
        'integracao.test',
        '--testPathIgnorePatterns',
        '/node_modules/',
        '--runInBand',
        '--forceExit'
    ],
    {
        cwd: diretorioRaiz,
        stdio: 'inherit',
        shell: true,
        env: process.env
    }
);

process.exit(resultado.status ?? 1);
