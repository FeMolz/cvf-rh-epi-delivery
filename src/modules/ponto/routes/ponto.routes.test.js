import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const pontoControllerMock = {
    obterResumo: jest.fn((req, res) => res.status(200).json({ ok: true }))
};

const authMiddlewareMock = {
    isAuthenticated: jest.fn((req, res, next) => {
        req.user = { id: '1', role: 'ADMIN' };
        next();
    })
};

const rbacMiddlewareMock = {
    authorize: jest.fn(() => (req, res, next) => next())
};

jest.unstable_mockModule('../controllers/PontoController.js', () => ({
    default: pontoControllerMock
}));

jest.unstable_mockModule('../../../shared/middlewares/auth.js', () => ({
    isAuthenticated: authMiddlewareMock.isAuthenticated
}));

jest.unstable_mockModule('../../../shared/middlewares/rbac.js', () => ({
    authorize: rbacMiddlewareMock.authorize
}));

const pontoRoutes = (await import('./ponto.routes.js')).default;

const aplicacao = express();
aplicacao.use(express.json());
aplicacao.use('/ponto', pontoRoutes);

describe('ponto.routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('GET /ponto/resumo deve chamar pontoController.obterResumo', async () => {
        const resposta = await request(aplicacao).get('/ponto/resumo?data=2026-05-22');

        expect(resposta.statusCode).toBe(200);
        expect(pontoControllerMock.obterResumo).toHaveBeenCalled();
    });
});
