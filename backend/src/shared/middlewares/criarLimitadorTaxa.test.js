import { jest } from '@jest/globals';
import { criarLimitadorTaxaMemoria } from './criarLimitadorTaxaMemoria.js';

const criarRespostaMock = () => {
    const resposta = {};
    resposta.status = jest.fn().mockReturnValue(resposta);
    resposta.json = jest.fn().mockReturnValue(resposta);
    return resposta;
};

describe('criarLimitadorTaxaMemoria', () => {
    beforeEach(() => {
        jest.useRealTimers();
    });

    it('deve usar opções padrão quando nenhuma opção é informada', () => {
        const limitador = criarLimitadorTaxaMemoria();
        const requisicao = { ip: '10.0.0.9', path: '/rota-padrao' };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        limitador(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledTimes(1);
        expect(resposta.status).not.toHaveBeenCalled();
    });

    it('deve reiniciar contagem após expirar a janela', () => {
        jest.useFakeTimers();
        const limitador = criarLimitadorTaxaMemoria({
            janelaMs: 1_000,
            limiteRequisicoes: 1
        });
        const requisicao = { ip: '10.0.0.3', path: '/rota-expira' };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        limitador(requisicao, resposta, proximo);
        jest.advanceTimersByTime(1_001);
        limitador(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledTimes(2);
        expect(resposta.status).not.toHaveBeenCalled();
    });

    it('deve permitir requisições dentro do limite', () => {
        const limitador = criarLimitadorTaxaMemoria({
            janelaMs: 60_000,
            limiteRequisicoes: 2
        });
        const requisicao = { ip: '10.0.0.1', path: '/rota-teste-a' };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        limitador(requisicao, resposta, proximo);
        limitador(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledTimes(2);
        expect(resposta.status).not.toHaveBeenCalled();
    });

    it('deve retornar 429 ao exceder o limite na janela', () => {
        const limitador = criarLimitadorTaxaMemoria({
            janelaMs: 60_000,
            limiteRequisicoes: 2,
            mensagem: 'Limite atingido'
        });
        const requisicao = { ip: '10.0.0.2', path: '/rota-teste-b' };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        limitador(requisicao, resposta, proximo);
        limitador(requisicao, resposta, proximo);
        limitador(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledTimes(2);
        expect(resposta.status).toHaveBeenCalledWith(429);
        expect(resposta.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Limite atingido'
        });
    });
});

describe('criarLimitadorTaxa', () => {
    const limitadorMemoriaMock = jest.fn();
    const obterClienteRedisMock = jest.fn();

    const importarLimitador = async (nodeEnv = 'development', clienteRedis = null) => {
        jest.resetModules();
        limitadorMemoriaMock.mockImplementation(() => {
            const proximo = jest.fn();
            return (_requisicao, _resposta, next) => next();
        });
        obterClienteRedisMock.mockReturnValue(clienteRedis);

        jest.unstable_mockModule('../../config/env.js', () => ({
            default: {
                NODE_ENV: nodeEnv,
                RATE_LIMIT_LOGIN_MAX: 5,
                RATE_LIMIT_PUBLICO_MAX: 50,
                RATE_LIMIT_GLOBAL_MAX: 100
            }
        }));
        jest.unstable_mockModule('../providers/redis/obterClienteRedis.js', () => ({
            obterClienteRedis: obterClienteRedisMock
        }));
        jest.unstable_mockModule('./criarLimitadorTaxaMemoria.js', () => ({
            criarLimitadorTaxaMemoria: limitadorMemoriaMock
        }));

        return import('./criarLimitadorTaxa.js');
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve ignorar limitação quando NODE_ENV é test', async () => {
        const { criarLimitadorTaxa } = await importarLimitador('test');
        const limitador = criarLimitadorTaxa();
        const proximo = jest.fn();

        await limitador({ ip: '1.1.1.1', path: '/x' }, criarRespostaMock(), proximo);

        expect(proximo).toHaveBeenCalled();
        expect(obterClienteRedisMock).not.toHaveBeenCalled();
    });

    it('deve usar limitador em memória quando Redis não estiver disponível', async () => {
        const { criarLimitadorTaxa } = await importarLimitador();
        const limitador = criarLimitadorTaxa();
        const proximo = jest.fn();

        await limitador({ ip: '1.1.1.1', path: '/x' }, criarRespostaMock(), proximo);

        expect(limitadorMemoriaMock).toHaveBeenCalled();
        expect(proximo).toHaveBeenCalled();
    });

    it('deve permitir requisição quando contagem Redis estiver dentro do limite', async () => {
        const clienteRedis = {
            status: 'ready',
            connect: jest.fn(),
            incr: jest.fn().mockResolvedValue(1),
            pexpire: jest.fn().mockResolvedValue(1)
        };

        const { criarLimitadorTaxa } = await importarLimitador('development', clienteRedis);
        const limitador = criarLimitadorTaxa({ limiteRequisicoes: 3, prefixoChave: 'api' });
        const proximo = jest.fn();

        await limitador({ ip: '2.2.2.2', path: '/login' }, criarRespostaMock(), proximo);

        expect(clienteRedis.incr).toHaveBeenCalledWith('rate-limit:api:2.2.2.2:/login');
        expect(clienteRedis.pexpire).toHaveBeenCalledWith('rate-limit:api:2.2.2.2:/login', 900_000);
        expect(proximo).toHaveBeenCalled();
    });

    it('deve conectar Redis quando status não for ready', async () => {
        const clienteRedis = {
            status: 'connecting',
            connect: jest.fn().mockResolvedValue(undefined),
            incr: jest.fn().mockResolvedValue(2),
            pexpire: jest.fn()
        };

        const { criarLimitadorTaxa } = await importarLimitador('development', clienteRedis);
        const limitador = criarLimitadorTaxa({ limiteRequisicoes: 5 });
        const proximo = jest.fn();

        await limitador({ ip: '3.3.3.3', path: '/publico' }, criarRespostaMock(), proximo);

        expect(clienteRedis.connect).toHaveBeenCalled();
        expect(proximo).toHaveBeenCalled();
    });

    it('deve retornar 429 quando contagem Redis exceder o limite', async () => {
        const clienteRedis = {
            status: 'ready',
            connect: jest.fn(),
            incr: jest.fn().mockResolvedValue(4),
            pexpire: jest.fn()
        };

        const { criarLimitadorTaxa } = await importarLimitador('development', clienteRedis);
        const limitador = criarLimitadorTaxa({
            limiteRequisicoes: 3,
            mensagem: 'Bloqueado'
        });
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        await limitador({ ip: '4.4.4.4', path: '/rota' }, resposta, proximo);

        expect(resposta.status).toHaveBeenCalledWith(429);
        expect(resposta.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Bloqueado'
        });
        expect(proximo).not.toHaveBeenCalled();
    });

    it('deve fazer fallback para memória quando Redis lançar erro', async () => {
        const clienteRedis = {
            status: 'ready',
            connect: jest.fn(),
            incr: jest.fn().mockRejectedValue(new Error('redis indisponível')),
            pexpire: jest.fn()
        };

        const { criarLimitadorTaxa } = await importarLimitador('development', clienteRedis);
        const limitador = criarLimitadorTaxa();
        const proximo = jest.fn();

        await limitador({ ip: '5.5.5.5', path: '/erro' }, criarRespostaMock(), proximo);

        expect(limitadorMemoriaMock).toHaveBeenCalled();
        expect(proximo).toHaveBeenCalled();
    });
});
