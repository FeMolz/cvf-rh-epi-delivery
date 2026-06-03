import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const userControllerMock = {
    create: jest.fn((req, res) => res.status(201).json({ id: '1' })),
    login: jest.fn((req, res) => res.status(200).json({ token: 'jwt' })),
    deleteMe: jest.fn((req, res) => res.status(200).json({ message: 'Sua conta foi excluída com sucesso.' })),
    findAll: jest.fn((req, res) => res.status(200).json([{ id: '1' }])),
    findById: jest.fn((req, res) => res.status(200).json({ id: '1' })),
    findByEmail: jest.fn((req, res) => res.status(200).json({ id: '1' })),
    update: jest.fn((req, res) => res.status(200).json({ id: '1' })),
    delete: jest.fn((req, res) => res.status(200).json({ id: '1' })),
    changePassword: jest.fn((req, res) => res.status(200).json({ id: '1' }))
};

const authMiddlewareMock = {
    isAuthenticated: jest.fn((req, res, next) => {
        req.user = { id: '1', role: 'COLABORADOR' };
        next();
    })
};

const rbacMiddlewareMock = {
    authorize: jest.fn(() => (req, res, next) => next())
};

jest.unstable_mockModule('../controllers/UserController.js', () => ({
    default: userControllerMock
}));

jest.unstable_mockModule('../../../../src/shared/middlewares/auth.js', () => ({
    isAuthenticated: authMiddlewareMock.isAuthenticated
}));

jest.unstable_mockModule('../../../../src/shared/middlewares/rbac.js', () => ({
    authorize: rbacMiddlewareMock.authorize
}));

const userRoutes = (await import('./user.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('User Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('POST /users deve chamar userController.create', async () => {
        const res = await request(app).post('/users').send({ name: 'Teste', email: 'teste@teste.com', password: '123' });
        expect(res.statusCode).toBe(201);
        expect(userControllerMock.create).toHaveBeenCalled();
    });

    it('POST /users/login deve chamar userController.login', async () => {
        const res = await request(app).post('/users/login').send({ email: 'teste@teste.com', password: '123' });
        expect(res.statusCode).toBe(200);
        expect(userControllerMock.login).toHaveBeenCalled();
    });

    it('DELETE /users/me deve chamar userController.deleteMe', async () => {
        const res = await request(app).delete('/users/me');
        expect(res.statusCode).toBe(200);
        expect(userControllerMock.deleteMe).toHaveBeenCalled();
    });

    it('GET /users deve chamar userController.findAll', async () => {
        const res = await request(app).get('/users');
        expect(res.statusCode).toBe(200);
        expect(userControllerMock.findAll).toHaveBeenCalled();
    });

    it('GET /users/:id deve chamar userController.findById', async () => {
        const resposta = await request(app).get('/users/uuid-1');
        expect(resposta.statusCode).toBe(200);
        expect(userControllerMock.findById).toHaveBeenCalled();
    });

    it('GET /users/findByEmail/:email deve chamar userController.findByEmail', async () => {
        const resposta = await request(app).get('/users/findByEmail/admin@teste.com');
        expect(resposta.statusCode).toBe(200);
        expect(userControllerMock.findByEmail).toHaveBeenCalled();
    });

    it('PUT /users/:id deve chamar userController.update', async () => {
        const resposta = await request(app).put('/users/uuid-1').send({ name: 'Novo' });
        expect(resposta.statusCode).toBe(200);
        expect(userControllerMock.update).toHaveBeenCalled();
    });

    it('DELETE /users/:id deve chamar userController.delete', async () => {
        const resposta = await request(app).delete('/users/uuid-1');
        expect(resposta.statusCode).toBe(200);
        expect(userControllerMock.delete).toHaveBeenCalled();
    });

    it('PUT /users/password/:id deve chamar userController.changePassword', async () => {
        const resposta = await request(app)
            .put('/users/password/uuid-1')
            .send({ password: 'nova123' });
        expect(resposta.statusCode).toBe(200);
        expect(userControllerMock.changePassword).toHaveBeenCalled();
    });
});
