import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const quesitoControllerMock = {
    create: jest.fn((req, res) => res.status(201).json({ id: 1 })),
    listAll: jest.fn((req, res) => res.status(200).json([{ id: 1 }, { id: 2 }])),
    list: jest.fn((req, res) => res.status(200).json([{ id: 1 }])),
    update: jest.fn((req, res) => res.status(200).json({ id: req.params.id, nome: 'atualizado' })),
    delete: jest.fn((req, res) => res.status(200).json({ id: req.params.id }))
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

    it('GET /quesitos/todos deve chamar quesitoController.listAll', async () => {
        const resposta = await request(app).get('/quesitos/todos');
        expect(resposta.statusCode).toBe(200);
        expect(quesitoControllerMock.listAll).toHaveBeenCalled();
        expect(resposta.body).toHaveLength(2);
    });

    it('GET /quesitos deve chamar quesitoController.list', async () => {
        const resposta = await request(app).get('/quesitos');
        expect(resposta.statusCode).toBe(200);
        expect(quesitoControllerMock.list).toHaveBeenCalled();
    });

    it('DELETE /quesitos/:id deve chamar quesitoController.delete', async () => {
        const resposta = await request(app).delete('/quesitos/uuid-1');
        expect(resposta.statusCode).toBe(200);
        expect(quesitoControllerMock.delete).toHaveBeenCalled();
    });

    it('PUT /quesitos/:id deve chamar quesitoController.update', async () => {
        const resposta = await request(app)
            .put('/quesitos/uuid-1')
            .send({ descricao: 'Nova descrição' });
        expect(resposta.statusCode).toBe(200);
        expect(quesitoControllerMock.update).toHaveBeenCalled();
        expect(resposta.body.nome).toBe('atualizado');
    });
});
