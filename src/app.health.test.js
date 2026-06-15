import { jest } from '@jest/globals';
import request from 'supertest';

const prismaMock = {
    $queryRaw: jest.fn()
};

jest.unstable_mockModule('./config/database.js', () => ({
    default: prismaMock
}));

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

jest.unstable_mockModule('./shared/providers/EpiProvider/verificarDisponibilidadeCaepi.js', () => ({
    verificarDisponibilidadeCaepi: jest.fn().mockResolvedValue(true)
}));

const aplicacao = (await import('./app.js')).default;

describe('GET /health', () => {
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

    it('deve retornar 503 quando o banco falhar', async () => {
        prismaMock.$queryRaw.mockRejectedValue(new Error('conexao recusada'));

        const resposta = await request(aplicacao).get('/health');

        expect(resposta.statusCode).toBe(503);
        expect(resposta.body.database).toBe('UNAVAILABLE');
    });
});
