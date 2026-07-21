import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    garantirInfraestruturaTeste,
    prepararAmbienteFrontendTeste,
    prepararBancoTeste
} from '../e2e/helpers/infraestruturaTeste.mjs';

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
 * @param {import('node:child_process').ChildProcess | null} [processoMonitorado]
 * @param {number} [timeoutMs]
 */
async function aguardarUrl(url, processoMonitorado = null, timeoutMs = 120_000) {
    const inicio = Date.now();

    while (Date.now() - inicio < timeoutMs) {
        if (processoMonitorado && processoMonitorado.exitCode !== null) {
            throw new Error(
                `Processo do servidor encerrou com código ${processoMonitorado.exitCode} antes de ${url} ficar disponível`
            );
        }

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
        shell: true,
        env: process.env
    });

    processosFilhos.push(processo);
    return processo;
}

async function verificarLoginBackend(email, password) {
    return new Promise((resolver) => {
        const corpo = JSON.stringify({ email, password });

        const requisicao = http.request(
            {
                hostname: 'localhost',
                port: 3001,
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

async function backendProntoParaTestes() {
    if (!(await verificarUrl('http://localhost:3001/health'))) {
        return false;
    }

    const administrativoOk = await verificarLoginBackend(
        'administrativo@rhsystem.com',
        'AlterarSenha123!'
    );
    const adminOk = await verificarLoginBackend('admin@rhsystem.com', 'AlterarSenha123!');

    return administrativoOk && adminOk;
}

/**
 * @param {string[]} argumentosNpm
 * @param {string} url
 */
async function garantirServidor(argumentosNpm, url) {
    const ehBackend = url.includes('3001');
    const podeReutilizar = !process.env.CI;

    if (podeReutilizar && ehBackend && (await backendProntoParaTestes())) {
        console.log('[e2e] Backend de teste já disponível com credenciais válidas.');
        return null;
    }

    if (podeReutilizar && !ehBackend && (await verificarUrl(url))) {
        console.log(`[e2e] Servidor já disponível em ${url}`);
        return null;
    }

    console.log(`[e2e] Iniciando servidor para ${url}...`);
    const processo = iniciarProcesso(argumentosNpm);
    const timeoutMs = process.env.CI ? 180_000 : 120_000;
    await aguardarUrl(url, processo, timeoutMs);
    console.log(`[e2e] Servidor pronto em ${url}`);
    return processo;
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
        'Frontend em localhost:5173 não alcança a API de teste (porta 3001). Verifique RH_API_PORT e o proxy do Vite.'
    );
}

async function iniciarServidoresE2e() {
    await garantirInfraestruturaTeste();
    prepararAmbienteFrontendTeste();
    console.log('[e2e] Preparando schema e seeds antes de subir os servidores...');
    prepararBancoTeste();
    await garantirServidor(['run', 'dev:test', '-w', 'backend'], 'http://localhost:3001/health');
    await garantirServidor(['run', 'dev:test', '-w', 'frontend'], 'http://localhost:5173');
    await aguardarProxyLogin(process.env.CI ? 180_000 : 120_000);
    console.log('[e2e] Backend e frontend prontos para os testes.');
    await new Promise(() => {});
}

try {
    await iniciarServidoresE2e();
} catch (erro) {
    console.error('[e2e] Falha ao preparar servidores para os testes E2E:');
    console.error(erro instanceof Error ? erro.stack || erro.message : erro);
    encerrarProcessos();
    process.exit(1);
}
