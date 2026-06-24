import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const diretorioRaiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arquivoEnvTeste = path.join(diretorioRaiz, '.env.test');

export function carregarAmbienteTeste() {
    if (fs.existsSync(arquivoEnvTeste)) {
        const resultado = dotenv.config({ path: arquivoEnvTeste, override: true });

        if (resultado.error) {
            console.error('Falha ao ler .env.test:', resultado.error.message);
            process.exit(1);
        }
    } else if (!process.env.DATABASE_URL) {
        console.error(
            'Arquivo .env.test não encontrado. Copie .env.test.example para .env.test e ajuste DATABASE_URL, ou defina DATABASE_URL no ambiente.'
        );
        process.exit(1);
    }

    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL ausente. Configure em .env.test ou na variável de ambiente.');
        process.exit(1);
    }

    return process.env.DATABASE_URL;
}

export { diretorioRaiz, arquivoEnvTeste };
