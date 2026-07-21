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
