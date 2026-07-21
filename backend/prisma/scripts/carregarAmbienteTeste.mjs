import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const diretorioRaiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arquivoEnvTeste = path.join(diretorioRaiz, '.env.test');
const arquivoEnvTesteExemplo = path.join(diretorioRaiz, '.env.test.example');

/**
 * @param {string} caminhoArquivo
 * @param {boolean} sobrescreverVariaveisExistentes
 */
function carregarArquivoEnv(caminhoArquivo, sobrescreverVariaveisExistentes) {
    const resultado = dotenv.config({
        path: caminhoArquivo,
        override: sobrescreverVariaveisExistentes
    });

    if (resultado.error) {
        console.error(`Falha ao ler ${path.basename(caminhoArquivo)}:`, resultado.error.message);
        process.exit(1);
    }
}

export function carregarAmbienteTeste() {
    const variaveisProtegidasCi = process.env.CI
        ? {
              DATABASE_URL: process.env.DATABASE_URL,
              JWT_SECRET: process.env.JWT_SECRET,
              REDIS_URL: process.env.REDIS_URL,
              PORT: process.env.PORT,
              NODE_ENV: process.env.NODE_ENV,
              ADMIN_SEED_PASSWORD: process.env.ADMIN_SEED_PASSWORD,
              SUPABASE_URL: process.env.SUPABASE_URL,
              SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
              SUPABASE_STORAGE_BUCKET_EPI_REPORTS: process.env.SUPABASE_STORAGE_BUCKET_EPI_REPORTS,
              PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH
          }
        : null;

    const possuiDatabaseUrlCi = Boolean(process.env.CI && process.env.DATABASE_URL);

    if (fs.existsSync(arquivoEnvTeste) && !possuiDatabaseUrlCi) {
        carregarArquivoEnv(arquivoEnvTeste, true);
    } else if (fs.existsSync(arquivoEnvTesteExemplo)) {
        // CI e clones novos: defaults do exemplo sem sobrescrever DATABASE_URL/JWT do workflow.
        carregarArquivoEnv(arquivoEnvTesteExemplo, false);
    } else if (!process.env.DATABASE_URL) {
        console.error(
            'Arquivo .env.test não encontrado. Copie .env.test.example para .env.test e ajuste DATABASE_URL, ' +
                'ou defina DATABASE_URL no ambiente.'
        );
        process.exit(1);
    }

    if (variaveisProtegidasCi) {
        for (const [chave, valor] of Object.entries(variaveisProtegidasCi)) {
            if (valor !== undefined) {
                process.env[chave] = valor;
            }
        }
    }

    if (!process.env.DATABASE_URL) {
        console.error(
            'DATABASE_URL ausente. Copie .env.test.example para .env.test (local) ' +
                'ou defina DATABASE_URL no ambiente (CI).'
        );
        process.exit(1);
    }

    return process.env.DATABASE_URL;
}

export { diretorioRaiz, arquivoEnvTeste };
