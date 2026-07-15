import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const noticiasControllerMock = {
    listarAniversariantes: jest.fn((req, res) => res.status(200).json({ aniversariantes: [] })),
    listarAfastamentos: jest.fn((req, res) => res.status(200).json({ afastamentos: [] }))
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

jest.unstable_mockModule('../controllers/NoticiasController.js', () => ({
    default: noticiasControllerMock
}));

jest.unstable_mockModule('../../../shared/middlewares/auth.js', () => ({
    isAuthenticated: authMiddlewareMock.isAuthenticated
}));

jest.unstable_mockModule('../../../shared/middlewares/rbac.js', () => ({
    authorize: rbacMiddlewareMock.authorize
}));

const noticiasRoutes = (await import('./noticias.routes.js')).default;

const aplicacao = express();
aplicacao.use(express.json());
aplicacao.use('/noticias', noticiasRoutes);

describe('noticias.routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('GET /noticias/aniversariantes deve chamar noticiasController.listarAniversariantes', async () => {
        const resposta = await request(aplicacao).get('/noticias/aniversariantes');

        expect(resposta.statusCode).toBe(200);
        expect(noticiasControllerMock.listarAniversariantes).toHaveBeenCalled();
    });

    it('GET /noticias/afastamentos deve chamar noticiasController.listarAfastamentos', async () => {
        const resposta = await request(aplicacao).get('/noticias/afastamentos');

        expect(resposta.statusCode).toBe(200);
        expect(noticiasControllerMock.listarAfastamentos).toHaveBeenCalled();
    });
});
