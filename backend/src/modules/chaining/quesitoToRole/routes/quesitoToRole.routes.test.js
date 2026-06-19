import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const quesitoToRoleControllerMock = {
    link: jest.fn((req, res) => res.status(201).json({ id: 1 })),
    unlink: jest.fn((req, res) => res.status(200).json({ message: 'ok' })),
    listByRole: jest.fn((req, res) => res.status(200).json([{ id: 1 }]))
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

jest.unstable_mockModule('../controllers/QuesitoToRoleController.js', () => ({
    default: quesitoToRoleControllerMock
}));

jest.unstable_mockModule('../../../../shared/middlewares/auth.js', () => ({
    isAuthenticated: authMiddlewareMock.isAuthenticated
}));

jest.unstable_mockModule('../../../../shared/middlewares/rbac.js', () => ({
    authorize: rbacMiddlewareMock.authorize
}));

const quesitoToRoleRoutes = (await import('./quesitoToRole.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/roles-quesitos', quesitoToRoleRoutes);

describe('QuesitoToRole Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('POST /roles-quesitos deve chamar quesitoToRoleController.link', async () => {
        const resposta = await request(app).post('/roles-quesitos').send({ roleId: '1', quesitoId: '2' });
        expect(resposta.statusCode).toBe(201);
        expect(quesitoToRoleControllerMock.link).toHaveBeenCalled();
    });

    it('DELETE /roles-quesitos/:roleId/:quesitoId deve chamar unlink', async () => {
        const resposta = await request(app).delete('/roles-quesitos/1/2');
        expect(resposta.statusCode).toBe(200);
        expect(quesitoToRoleControllerMock.unlink).toHaveBeenCalled();
    });

    it('GET /roles-quesitos/:roleId deve chamar listByRole', async () => {
        const resposta = await request(app).get('/roles-quesitos/1');
        expect(resposta.statusCode).toBe(200);
        expect(quesitoToRoleControllerMock.listByRole).toHaveBeenCalled();
    });
});
