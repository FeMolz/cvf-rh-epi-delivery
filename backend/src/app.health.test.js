import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const prismaMock = {
    $queryRaw: jest.fn()
};

const verificarDisponibilidadeCaepiMock = jest.fn();

const mocksBase = () => {
    jest.unstable_mockModule('./config/database.js', () => ({
        default: prismaMock
    }));
    jest.unstable_mockModule('./shared/providers/EpiProvider/verificarDisponibilidadeCaepi.js', () => ({
        verificarDisponibilidadeCaepi: verificarDisponibilidadeCaepiMock
    }));
};

jest.unstable_mockModule('./config/env.js', () => ({
    default: {
        NODE_ENV: 'test',
        JWT_SECRET: 'segredo-teste-local-16',
        TRUST_PROXY_SALTOS: 0,
        TOKEN_CADASTRO_VALIDADE_DIAS: 7,
        RATE_LIMIT_GLOBAL_MAX: 1000,
        CAEPI_API_URL: 'http://localhost:8080'
    }
}));

mocksBase();

const aplicacao = (await import('./app.js')).default;

describe('GET /health', () => {
    beforeEach(() => {
        verificarDisponibilidadeCaepiMock.mockResolvedValue(true);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar 200 quando o banco responder', async () => {
        prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

        const resposta = await request(aplicacao).get('/health');

        expect(resposta.statusCode).toBe(200);
        expect(resposta.body).toMatchObject({
            status: 'OK',
            database: 'OK',
            caepi: 'OK'
        });
    });

    it('deve retornar caepi indisponível quando probe falhar', async () => {
        prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
        verificarDisponibilidadeCaepiMock.mockResolvedValue(false);

        const resposta = await request(aplicacao).get('/health');

        expect(resposta.statusCode).toBe(200);
        expect(resposta.body.caepi).toBe('UNAVAILABLE');
    });

    it('deve retornar 503 quando o banco falhar', async () => {
        prismaMock.$queryRaw.mockRejectedValue(new Error('conexao recusada'));

        const resposta = await request(aplicacao).get('/health');

        expect(resposta.statusCode).toBe(503);
        expect(resposta.body.database).toBe('UNAVAILABLE');
    });
});

describe('app com trust proxy', () => {
    it('deve configurar trust proxy quando TRUST_PROXY_SALTOS for maior que zero', async () => {
        jest.resetModules();
        mocksBase();
        jest.unstable_mockModule('./config/env.js', () => ({
            default: {
                NODE_ENV: 'test',
                JWT_SECRET: 'segredo-teste-local-16',
                TRUST_PROXY_SALTOS: 2,
                TOKEN_CADASTRO_VALIDADE_DIAS: 7,
                RATE_LIMIT_GLOBAL_MAX: 1000,
                CAEPI_API_URL: 'http://localhost:8080'
            }
        }));

        const appComProxy = (await import('./app.js')).default;

        expect(appComProxy.get('trust proxy')).toBe(2);
    });
});

describe('global error handler', () => {
    const importarAppComRotaErro = async (nodeEnv) => {
        jest.resetModules();
        process.env.NODE_ENV = nodeEnv;
        mocksBase();
        jest.unstable_mockModule('./config/env.js', () => ({
            default: {
                NODE_ENV: nodeEnv,
                JWT_SECRET: 'segredo-teste-local-16',
                TRUST_PROXY_SALTOS: 0,
                TOKEN_CADASTRO_VALIDADE_DIAS: 7,
                RATE_LIMIT_GLOBAL_MAX: 1000,
                CAEPI_API_URL: 'http://localhost:8080'
            }
        }));

        const routerErro = express.Router();
        routerErro.get('/', () => {
            const erro = new Error('falha simulada');
            erro.statusCode = 418;
            throw erro;
        });

        jest.unstable_mockModule('./modules/roles/routes/role.routes.js', () => ({
            default: routerErro
        }));

        return import('./app.js');
    };

    afterEach(() => {
        process.env.NODE_ENV = 'test';
    });

    it('deve responder com statusCode customizado e requestId', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        const { default: appErro } = await importarAppComRotaErro('test');

        const resposta = await request(appErro).get('/api/v1/roles');

        expect(resposta.statusCode).toBe(418);
        expect(resposta.body).toEqual({
            error: 'falha simulada',
            requestId: expect.any(String)
        });
        expect(consoleError).toHaveBeenCalledWith(
            expect.stringMatching(/^\[/),
            expect.stringContaining('falha simulada')
        );

        consoleError.mockRestore();
    });

    it('deve registrar apenas mensagem em produção', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        const { default: appProducao } = await importarAppComRotaErro('production');

        await request(appProducao).get('/api/v1/roles');

        expect(consoleError).toHaveBeenCalledWith(expect.stringMatching(/^\[/), 'falha simulada');
        consoleError.mockRestore();
    });

    it('deve usar valores padrão quando erro não tiver mensagem nem statusCode', async () => {
        jest.resetModules();
        process.env.NODE_ENV = 'test';
        mocksBase();
        jest.unstable_mockModule('./config/env.js', () => ({
            default: {
                NODE_ENV: 'test',
                JWT_SECRET: 'segredo-teste-local-16',
                TRUST_PROXY_SALTOS: 0,
                TOKEN_CADASTRO_VALIDADE_DIAS: 7,
                RATE_LIMIT_GLOBAL_MAX: 1000,
                CAEPI_API_URL: 'http://localhost:8080'
            }
        }));

        const routerErro = express.Router();
        routerErro.get('/', () => {
            throw {};
        });

        jest.unstable_mockModule('./modules/roles/routes/role.routes.js', () => ({
            default: routerErro
        }));

        const { default: appErro } = await import('./app.js');
        const resposta = await request(appErro).get('/api/v1/roles');

        expect(resposta.statusCode).toBe(500);
        expect(resposta.body.error).toBe('Ocorreu um erro interno no servidor');
        expect(resposta.body.requestId).toEqual(expect.any(String));
    });

    it('deve usar requestId sem-id quando requisição não tiver identificador', async () => {
        jest.resetModules();
        mocksBase();
        jest.unstable_mockModule('./config/env.js', () => ({
            default: {
                NODE_ENV: 'test',
                JWT_SECRET: 'segredo-teste-local-16',
                TRUST_PROXY_SALTOS: 0,
                TOKEN_CADASTRO_VALIDADE_DIAS: 7,
                RATE_LIMIT_GLOBAL_MAX: 1000,
                CAEPI_API_URL: 'http://localhost:8080'
            }
        }));

        const { default: appErro } = await import('./app.js');
        const errorHandler = appErro.router.stack
            .filter((camada) => camada.handle?.length === 4)
            .at(-1).handle;
        const resposta = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        errorHandler({}, {}, resposta, () => {});

        expect(resposta.json).toHaveBeenCalledWith({
            error: 'Ocorreu um erro interno no servidor',
            requestId: 'sem-id'
        });
    });
});
