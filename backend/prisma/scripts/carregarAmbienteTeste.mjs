import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const diretorioRaiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arquivoEnvTeste = path.join(diretorioRaiz, '.env.test');

export function carregarAmbienteTeste() {
    if (!fs.existsSync(arquivoEnvTeste)) {
        console.error(
            'Arquivo .env.test não encontrado. Copie .env.test.example para .env.test e ajuste DATABASE_URL.'
        );
        process.exit(1);
    }

    const resultado = dotenv.config({ path: arquivoEnvTeste, override: true });

    if (resultado.error) {
        console.error('Falha ao ler .env.test:', resultado.error.message);
        process.exit(1);
    }

    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL ausente em .env.test');
        process.exit(1);
    }

    return process.env.DATABASE_URL;
}

export { diretorioRaiz, arquivoEnvTeste };
