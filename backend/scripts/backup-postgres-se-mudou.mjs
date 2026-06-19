import { createWriteStream } from 'node:fs';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createGzip } from 'node:zlib';
import { fileURLToPath } from 'node:url';

import pg from 'pg';

import { calcularFingerprintBanco } from './lib/fingerprintBancoPostgres.mjs';

const diretorioRaiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const diretorioBackups = process.env.BACKUP_DIR || path.join(diretorioRaiz, '.backups');
const arquivoManifesto = path.join(diretorioBackups, 'manifest.json');

/**
 * @returns {string}
 */
function resolverDirectUrl() {
    const url = process.env.DIRECT_URL || process.env.DATABASE_BACKUP_DIRECT_URL;

    if (!url) {
        console.error(
            'Defina DIRECT_URL (local) ou DATABASE_BACKUP_DIRECT_URL (CI) com a URL de sessão do Supabase (porta 5432).'
        );
        process.exit(1);
    }

    return url;
}

/**
 * @returns {{ ultimoFingerprint: string | null, ultimoArquivo: string | null }}
 */
function lerManifesto() {
    if (!fs.existsSync(arquivoManifesto)) {
        return { ultimoFingerprint: null, ultimoArquivo: null };
    }

    try {
        const dados = JSON.parse(fs.readFileSync(arquivoManifesto, 'utf8'));
        return {
            ultimoFingerprint: dados.fingerprint ?? null,
            ultimoArquivo: dados.arquivo ?? null
        };
    } catch {
        return { ultimoFingerprint: null, ultimoArquivo: null };
    }
}

/**
 * @param {string} fingerprint
 * @param {string} arquivo
 */
function salvarManifesto(fingerprint, arquivo) {
    fs.mkdirSync(diretorioBackups, { recursive: true });
    fs.writeFileSync(
        arquivoManifesto,
        JSON.stringify(
            {
                fingerprint,
                arquivo,
                atualizadoEm: new Date().toISOString()
            },
            null,
            2
        )
    );
}

/**
 * @param {string} connectionString
 * @param {string} destino
 * @returns {Promise<void>}
 */
async function executarPgDump(connectionString, destino) {
    await new Promise((resolver, rejeitar) => {
        const processo = spawn('pg_dump', ['--no-owner', '--no-acl', connectionString]);
        const gzip = createGzip();
        const saida = createWriteStream(destino);

        processo.stdout.pipe(gzip).pipe(saida);

        processo.on('error', rejeitar);
        saida.on('error', rejeitar);

        processo.on('close', (codigo) => {
            if (codigo === 0) {
                resolver();
            } else {
                rejeitar(new Error(`pg_dump encerrou com código ${codigo}`));
            }
        });
    });
}

async function main() {
    const connectionString = resolverDirectUrl();
    const cliente = new pg.Client({
        connectionString,
        ssl: connectionString.includes('supabase.com') ? { rejectUnauthorized: false } : undefined
    });

    await cliente.connect();

    try {
        const fingerprintAtual = await calcularFingerprintBanco(cliente);
        const { ultimoFingerprint } = lerManifesto();

        if (fingerprintAtual === ultimoFingerprint) {
            console.log('[backup] Banco sem alterações desde o último backup. Nenhum arquivo gerado.');
            return;
        }

        const carimbo = new Date().toISOString().replace(/[:.]/g, '-');
        const nomeArquivo = `rh-system-${carimbo}.sql.gz`;
        const caminhoCompleto = path.join(diretorioBackups, nomeArquivo);

        fs.mkdirSync(diretorioBackups, { recursive: true });
        await executarPgDump(connectionString, caminhoCompleto);

        salvarManifesto(fingerprintAtual, nomeArquivo);

        console.log(`[backup] Alteração detectada. Backup salvo em ${caminhoCompleto}`);
        console.log(`[backup] Fingerprint: ${fingerprintAtual}`);
    } finally {
        await cliente.end();
    }
}

main().catch((erro) => {
    console.error('[backup] Falha:', erro.message);
    process.exit(1);
});
