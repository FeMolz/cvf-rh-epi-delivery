import { jest } from '@jest/globals';
import request from 'supertest';

const prismaMock = {
    $queryRaw: jest.fn()
};

jest.unstable_mockModule('./config/database.js', () => ({
    default: prismaMock
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
            database: 'OK'
        });
    });

    it('deve retornar 503 quando o banco falhar', async () => {
        prismaMock.$queryRaw.mockRejectedValue(new Error('conexao recusada'));

        const resposta = await request(aplicacao).get('/health');

        expect(resposta.statusCode).toBe(503);
        expect(resposta.body.database).toBe('UNAVAILABLE');
    });
});
