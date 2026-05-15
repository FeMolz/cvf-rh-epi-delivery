import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const quesitoControllerMock = {
    create: jest.fn((req, res) => res.status(201).json({ id: 1 })),
    list: jest.fn((req, res) => res.status(200).json([{ id: 1 }]))
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

jest.unstable_mockModule('../controllers/QuesitoController.js', () => ({
    default: quesitoControllerMock
}));

jest.unstable_mockModule('../../../shared/middlewares/auth.js', () => ({
    isAuthenticated: authMiddlewareMock.isAuthenticated
}));

jest.unstable_mockModule('../../../shared/middlewares/rbac.js', () => ({
    authorize: rbacMiddlewareMock.authorize
}));

const quesitoRoutes = (await import('./quesito.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/quesitos', quesitoRoutes);

describe('Quesito Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('POST /quesitos deve chamar quesitoController.create', async () => {
        const resposta = await request(app).post('/quesitos').send({
            nome: 'teste',
            descricao: 'd',
            bloco: 'b'
        });
        expect(resposta.statusCode).toBe(201);
        expect(quesitoControllerMock.create).toHaveBeenCalled();
    });

    it('GET /quesitos deve chamar quesitoController.list', async () => {
        const resposta = await request(app).get('/quesitos');
        expect(resposta.statusCode).toBe(200);
        expect(quesitoControllerMock.list).toHaveBeenCalled();
    });
});
