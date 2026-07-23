import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const diretorioBackend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const nomeArquivoAmbiente = process.env.RH_ENV_ARQUIVO || '.env';

dotenv.config({ path: path.join(diretorioBackend, nomeArquivoAmbiente) });

/**
 * @param {string | undefined} valor
 */
function normalizarVariavelOpcional(valor) {
    if (valor === undefined || valor === null) {
        return null;
    }

    const texto = String(valor).trim();
    return texto || null;
}

if (process.env.SUPABASE_URL) {
    process.env.SUPABASE_URL = normalizarVariavelOpcional(process.env.SUPABASE_URL) ?? '';
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY =
        normalizarVariavelOpcional(process.env.SUPABASE_SERVICE_ROLE_KEY) ?? '';
}

import {
    DIAS_VALIDADE_TOKEN_CADASTRO_PADRAO,
    LIMITE_REQUISICOES_GLOBAL_PADRAO
} from '../shared/constants/segurancaConstantes.js';
import {
    validarCaepiProducao,
    validarOrigensCorsProducao,
    validarRedisProducao,
    validarSegredoJwt,
    validarSupabaseStorageProducao
} from './validarConfiguracaoAmbiente.js';
import { BUCKET_PADRAO_RELATORIOS_EPI } from '../shared/providers/SupabaseStorageProvider/constants/storageConstantes.js';
import { resolverCaminhoExecutavelPuppeteer } from '../shared/providers/EpiDeliveryReportPdfProvider/utils/resolverCaminhoExecutavelPuppeteer.js';
import { URL_PADRAO_CAEPI_API } from '../shared/constants/caepiConstantes.js';

const NODE_ENV = process.env.NODE_ENV || 'development';

validarSegredoJwt(process.env.JWT_SECRET, NODE_ENV);
validarOrigensCorsProducao(process.env.CORS_ORIGINS, NODE_ENV);
validarRedisProducao(process.env.REDIS_URL, NODE_ENV);
validarCaepiProducao(process.env.CAEPI_API_URL, NODE_ENV);
validarSupabaseStorageProducao(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV
);

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

function resolverAguardarInicioCaepi() {
    const valorExplicito = process.env.CAEPI_AGUARDAR_INICIO;

    if (valorExplicito === 'false' || valorExplicito === '0') {
        return false;
    }

    if (valorExplicito === 'true' || valorExplicito === '1') {
        return true;
    }

    return NODE_ENV === 'production';
}

const env = {
    PORT: Number(process.env.PORT) || 3000,
    DATABASE_URL: process.env.DATABASE_URL,
    DB_HOST: process.env.DB_HOST,
    NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    CORS_ORIGINS: process.env.CORS_ORIGINS,
    TRUST_PROXY_SALTOS: Number(process.env.TRUST_PROXY_SALTOS) || 0,
    TOKEN_CADASTRO_VALIDADE_DIAS:
        Number(process.env.TOKEN_CADASTRO_VALIDADE_DIAS) || DIAS_VALIDADE_TOKEN_CADASTRO_PADRAO,
    RATE_LIMIT_GLOBAL_MAX:
        Number(process.env.RATE_LIMIT_GLOBAL_MAX) || LIMITE_REQUISICOES_GLOBAL_PADRAO,
    RATE_LIMIT_LOGIN_MAX: Number(process.env.RATE_LIMIT_LOGIN_MAX) || 20,
    RATE_LIMIT_PUBLICO_MAX: Number(process.env.RATE_LIMIT_PUBLICO_MAX) || 60,
    REDIS_URL: process.env.REDIS_URL || null,
    HEALTH_CHECK_TOKEN: process.env.HEALTH_CHECK_TOKEN || null,
    CAEPI_API_URL: process.env.CAEPI_API_URL || URL_PADRAO_CAEPI_API,
    CAEPI_AGUARDAR_INICIO: resolverAguardarInicioCaepi(),
    CAEPI_USAR_SOMENTE_CACHE: process.env.CAEPI_USAR_SOMENTE_CACHE === 'true',
    SUPABASE_URL: normalizarVariavelOpcional(process.env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: normalizarVariavelOpcional(process.env.SUPABASE_SERVICE_ROLE_KEY),
    SUPABASE_STORAGE_BUCKET_EPI_REPORTS:
        process.env.SUPABASE_STORAGE_BUCKET_EPI_REPORTS || BUCKET_PADRAO_RELATORIOS_EPI,
    PUPPETEER_EXECUTABLE_PATH: resolverCaminhoExecutavelPuppeteer() || null
};

export default env;
