import Redis from 'ioredis';

import env from '../../../config/env.js';

/** @type {import('ioredis').default | null} */
let clienteRedis = null;

/** @type {boolean} */
let redisIndisponivel = false;

/**
 * @returns {import('ioredis').default | null}
 */
export function obterClienteRedis() {
    if (redisIndisponivel || !env.REDIS_URL) {
        return null;
    }

    if (!clienteRedis) {
        clienteRedis = new Redis(env.REDIS_URL, {
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            lazyConnect: true
        });

        clienteRedis.on('error', (erro) => {
            console.error('[Redis] Conexão indisponível:', erro.message);
            redisIndisponivel = true;
        });
    }

    return clienteRedis;
}

export function reiniciarEstadoRedisParaTestes() {
    if (clienteRedis) {
        clienteRedis.disconnect();
    }
    clienteRedis = null;
    redisIndisponivel = false;
}
