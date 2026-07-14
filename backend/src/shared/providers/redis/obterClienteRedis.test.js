import { jest } from '@jest/globals';

const redisInstanceMock = {
    on: jest.fn(),
    disconnect: jest.fn()
};

const RedisMock = jest.fn().mockImplementation(() => redisInstanceMock);

const envMock = {
    REDIS_URL: 'redis://localhost:6379'
};

describe('obterClienteRedis', () => {
    let obterClienteRedis;
    let reiniciarEstadoRedisParaTestes;

    beforeEach(async () => {
        jest.resetModules();
        envMock.REDIS_URL = 'redis://localhost:6379';
        RedisMock.mockClear();
        redisInstanceMock.on.mockClear();
        redisInstanceMock.disconnect.mockClear();

        jest.unstable_mockModule('ioredis', () => ({
            default: RedisMock
        }));
        jest.unstable_mockModule('../../../config/env.js', () => ({
            default: envMock
        }));

        ({ obterClienteRedis, reiniciarEstadoRedisParaTestes } = await import('./obterClienteRedis.js'));
    });

    afterEach(() => {
        reiniciarEstadoRedisParaTestes();
        jest.resetModules();
    });

    it('deve retornar null quando REDIS_URL não estiver definida', () => {
        envMock.REDIS_URL = null;

        expect(obterClienteRedis()).toBeNull();
        expect(RedisMock).not.toHaveBeenCalled();
    });

    it('deve criar cliente Redis singleton com configuração lazy', () => {
        const cliente = obterClienteRedis();
        const mesmoCliente = obterClienteRedis();

        expect(RedisMock).toHaveBeenCalledTimes(1);
        expect(RedisMock).toHaveBeenCalledWith('redis://localhost:6379', {
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            lazyConnect: true
        });
        expect(cliente).toBe(redisInstanceMock);
        expect(mesmoCliente).toBe(cliente);
        expect(redisInstanceMock.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('deve marcar Redis como indisponível após erro de conexão', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        obterClienteRedis();
        const handlerErro = redisInstanceMock.on.mock.calls.find(([evento]) => evento === 'error')[1];

        handlerErro(new Error('conexão recusada'));

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[Redis] Conexão indisponível:',
            'conexão recusada'
        );
        expect(obterClienteRedis()).toBeNull();

        consoleErrorSpy.mockRestore();
    });

    it('deve reiniciar estado interno para testes', () => {
        obterClienteRedis();
        reiniciarEstadoRedisParaTestes();

        expect(redisInstanceMock.disconnect).toHaveBeenCalled();
        expect(RedisMock).toHaveBeenCalledTimes(1);

        obterClienteRedis();
        expect(RedisMock).toHaveBeenCalledTimes(2);
    });
});
