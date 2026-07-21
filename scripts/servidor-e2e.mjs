import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { garantirInfraestruturaTeste, prepararBancoTeste } from '../e2e/helpers/infraestruturaTeste.mjs';

const diretorioRaiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const processosFilhos = [];

/**
 * @param {string} url
 */
function verificarUrl(url) {
    return new Promise((resolver) => {
        const requisicao = http.get(url, (resposta) => {
            resposta.resume();
            resolver(resposta.statusCode !== undefined && resposta.statusCode < 500);
        });

        requisicao.on('error', () => resolver(false));
        requisicao.setTimeout(2_000, () => {
            requisicao.destroy();
            resolver(false);
        });
    });
}

/**
 * @param {string} url
 * @param {number} [timeoutMs]
 */
async function aguardarUrl(url, timeoutMs = 120_000) {
    const inicio = Date.now();

    while (Date.now() - inicio < timeoutMs) {
        if (await verificarUrl(url)) {
            return;
        }

        await new Promise((resolver) => setTimeout(resolver, 500));
    }

    throw new Error(`Timeout aguardando ${url}`);
}

/**
 * @param {string[]} argumentosNpm
 */
function iniciarProcesso(argumentosNpm) {
    const processo = spawn('npm', argumentosNpm, {
        cwd: diretorioRaiz,
        stdio: 'inherit',
        shell: true
    });

    processosFilhos.push(processo);
    return processo;
}

async function garantirServidor(argumentosNpm, url) {
    if (await verificarUrl(url)) {
        console.log(`[e2e] Servidor já disponível em ${url}`);
        return;
    }

    console.log(`[e2e] Iniciando servidor para ${url}...`);
    iniciarProcesso(argumentosNpm);
    await aguardarUrl(url);
    console.log(`[e2e] Servidor pronto em ${url}`);
}

function encerrarProcessos() {
    for (const processo of processosFilhos) {
        if (!processo.killed) {
            processo.kill();
        }
    }
}

process.on('SIGINT', () => {
    encerrarProcessos();
    process.exit(0);
});

process.on('SIGTERM', () => {
    encerrarProcessos();
    process.exit(0);
});

async function verificarProxyLogin() {
    return new Promise((resolver) => {
        const corpo = JSON.stringify({
            email: 'administrativo@rhsystem.com',
            password: 'AlterarSenha123!'
        });

        const requisicao = http.request(
            {
                hostname: 'localhost',
                port: 5173,
                path: '/api/v1/users/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(corpo)
                }
            },
            (resposta) => {
                resposta.resume();
                resolver(resposta.statusCode === 200);
            }
        );

        requisicao.on('error', () => resolver(false));
        requisicao.write(corpo);
        requisicao.end();
    });
}

/**
 * @param {number} [timeoutMs]
 */
async function aguardarProxyLogin(timeoutMs = 120_000) {
    const inicio = Date.now();

    while (Date.now() - inicio < timeoutMs) {
        if (await verificarProxyLogin()) {
            return;
        }

        await new Promise((resolver) => setTimeout(resolver, 1_000));
    }

    throw new Error(
        'Frontend em localhost:5173 não alcança a API de teste (porta 3001). Use `npm run dev:test` no frontend.'
    );
}

await garantirInfraestruturaTeste();
console.log('[e2e] Preparando schema e seeds antes de subir os servidores...');
prepararBancoTeste();
await garantirServidor(['run', 'dev:test', '-w', 'backend'], 'http://localhost:3001/health');
await garantirServidor(['run', 'dev:test', '-w', 'frontend'], 'http://localhost:5173');

await aguardarProxyLogin();

console.log('[e2e] Backend e frontend prontos para os testes.');

await new Promise(() => {});
