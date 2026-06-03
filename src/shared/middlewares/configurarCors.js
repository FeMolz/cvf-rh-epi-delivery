import cors from 'cors';

import env from '../../config/env.js';

/**
 * @returns {import('express').RequestHandler}
 */
export function configurarCors() {
    const origensConfiguradas = env.CORS_ORIGINS?.trim();
    const ambienteProducao = env.NODE_ENV === 'production';

    if (!origensConfiguradas || origensConfiguradas === '*') {
        if (ambienteProducao) {
            return cors({
                origin: false
            });
        }

        return cors();
    }

    const origensPermitidas = origensConfiguradas
        .split(',')
        .map((origem) => origem.trim())
        .filter((origem) => origem.length > 0);

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
