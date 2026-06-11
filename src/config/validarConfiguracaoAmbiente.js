import {
    TAMANHO_MINIMO_JWT_SECRET_DESENVOLVIMENTO,
    TAMANHO_MINIMO_JWT_SECRET_PRODUCAO
} from '../shared/constants/segurancaConstantes.js';

/**
 * @param {string} nomeVariavel
 * @param {string | undefined} valor
 */
export function exigirVariavelDefinida(nomeVariavel, valor) {
    if (!valor || String(valor).trim() === '') {
        throw new Error(`${nomeVariavel} não definida nas variáveis de ambiente.`);
    }
}

/**
 * @param {string | undefined} segredoJwt
 * @param {string} nodeEnv
 */
export function validarSegredoJwt(segredoJwt, nodeEnv) {
    exigirVariavelDefinida('JWT_SECRET', segredoJwt);

    const ambienteProducao = nodeEnv === 'production';
    const tamanhoMinimo = ambienteProducao
        ? TAMANHO_MINIMO_JWT_SECRET_PRODUCAO
        : TAMANHO_MINIMO_JWT_SECRET_DESENVOLVIMENTO;

    if (String(segredoJwt).length < tamanhoMinimo) {
        throw new Error(
            `JWT_SECRET deve ter pelo menos ${tamanhoMinimo} caracteres no ambiente ${nodeEnv}.`
        );
    }
}

/**
 * @param {string | undefined} origensCors
 * @param {string} nodeEnv
 */
/**
 * @param {string | undefined} urlRedis
 * @param {string} nodeEnv
 */
export function validarRedisProducao(urlRedis, nodeEnv) {
    if (nodeEnv !== 'production') {
        return;
    }

    if (!urlRedis || String(urlRedis).trim() === '') {
        throw new Error('REDIS_URL é obrigatória em produção para rate limit distribuído.');
    }
}

export function validarOrigensCorsProducao(origensCors, nodeEnv) {
    if (nodeEnv !== 'production') {
        return;
    }

    const origensNormalizadas = origensCors?.trim();

    if (!origensNormalizadas || origensNormalizadas === '*') {
        throw new Error(
            'CORS_ORIGINS deve listar origens explícitas separadas por vírgula em produção.'
        );
    }
}
