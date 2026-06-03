import cors from 'cors';

/**
 * @returns {import('express').RequestHandler}
 */
export function configurarCors() {
    const origensConfiguradas = process.env.CORS_ORIGINS?.trim();

    if (!origensConfiguradas || origensConfiguradas === '*') {
        return cors();
    }

    const origensPermitidas = origensConfiguradas
        .split(',')
        .map(origem => origem.trim())
        .filter(origem => origem.length > 0);

    return cors({
        origin(origem, callback) {
            if (!origem || origensPermitidas.includes(origem)) {
                return callback(null, true);
            }

            return callback(new Error('Origem não permitida pelo CORS'));
        },
        credentials: true
    });
}
