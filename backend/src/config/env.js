import 'dotenv/config';

import {
    DIAS_VALIDADE_TOKEN_CADASTRO_PADRAO,
    LIMITE_REQUISICOES_GLOBAL_PADRAO
} from '../shared/constants/segurancaConstantes.js';
import {
    validarCaepiProducao,
    validarOrigensCorsProducao,
    validarRedisProducao,
    validarSegredoJwt
} from './validarConfiguracaoAmbiente.js';
import { URL_PADRAO_CAEPI_API } from '../shared/constants/caepiConstantes.js';

const NODE_ENV = process.env.NODE_ENV || 'development';

validarSegredoJwt(process.env.JWT_SECRET, NODE_ENV);
validarOrigensCorsProducao(process.env.CORS_ORIGINS, NODE_ENV);
validarRedisProducao(process.env.REDIS_URL, NODE_ENV);
validarCaepiProducao(process.env.CAEPI_API_URL, NODE_ENV);

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
    CAEPI_USAR_SOMENTE_CACHE: process.env.CAEPI_USAR_SOMENTE_CACHE === 'true'
};

export default env;
