import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const diretorioRaiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * @param {string[]} argumentosNpm
 */
function iniciarProcesso(argumentosNpm) {
    return spawn('npm', argumentosNpm, {
        cwd: diretorioRaiz,
        stdio: 'inherit',
        shell: true
    });
}

const processos = [
    iniciarProcesso(['run', 'dev:test', '-w', 'backend']),
    iniciarProcesso(['run', 'dev:test', '-w', 'frontend'])
];

let encerrando = false;

function encerrarTodos(codigoSaida = 0) {
    if (encerrando) {
        return;
    }

    encerrando = true;

    for (const processo of processos) {
        if (!processo.killed) {
            processo.kill();
        }
    }

    process.exit(codigoSaida);
}

for (const processo of processos) {
    processo.on('exit', (codigo) => {
        if (codigo && codigo !== 0) {
            encerrarTodos(codigo);
        }
    });
}

process.on('SIGINT', () => encerrarTodos(0));
process.on('SIGTERM', () => encerrarTodos(0));
