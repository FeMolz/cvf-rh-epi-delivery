import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const diretorioRaiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arquivoEnvProducao = path.join(diretorioRaiz, '.env.production.local');

export function carregarAmbienteProducao() {
    if (!fs.existsSync(arquivoEnvProducao)) {
        console.error(
            'Arquivo .env.production.local não encontrado. Copie .env.production.example e preencha as credenciais Supabase.'
        );
        process.exit(1);
    }

    const resultado = dotenv.config({ path: arquivoEnvProducao, override: true });

    if (resultado.error) {
        console.error('Falha ao ler .env.production.local:', resultado.error.message);
        process.exit(1);
    }

    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL ausente em .env.production.local');
        process.exit(1);
    }

    if (!process.env.DIRECT_URL) {
        console.error('DIRECT_URL ausente em .env.production.local (necessária para migrations no Supabase)');
        process.exit(1);
    }

    process.env.NODE_ENV = process.env.NODE_ENV || 'production';

    return {
        databaseUrl: process.env.DATABASE_URL,
        directUrl: process.env.DIRECT_URL
    };
}

export { diretorioRaiz, arquivoEnvProducao };
