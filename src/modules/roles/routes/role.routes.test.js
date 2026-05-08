import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

// Criação dos Mocks para os Middlewares e o Controller
const roleControllerMock = {
    create: jest.fn((req, res) => res.status(201).send()),
    findAll: jest.fn((req, res) => res.status(200).send()),
    findById: jest.fn((req, res) => res.status(200).send()),
    update: jest.fn((req, res) => res.status(200).send()),
    delete: jest.fn((req, res) => res.status(204).send()),
};

const authMiddlewareMock = {
    isAuthenticated: jest.fn((req, res, next) => next())
};

const rbacMiddlewareMock = {
    authorize: jest.fn(() => (req, res, next) => next())
};

// Substituindo as importações reais pelos mocks usando unstable_mockModule
jest.unstable_mockModule('../controllers/RoleController.js', () => ({
    default: roleControllerMock
}));

jest.unstable_mockModule('../../../shared/middlewares/auth.js', () => ({
    isAuthenticated: authMiddlewareMock.isAuthenticated
}));

jest.unstable_mockModule('../../../shared/middlewares/rbac.js', () => ({
    authorize: rbacMiddlewareMock.authorize
}));

// Importando as rotas dinamicamente APÓS a criação dos mocks
const roleRoutes = (await import('./role.routes.js')).default;

// Inicialização de um app Express virtual para testar com Supertest
const app = express();
app.use(express.json());
app.use('/api/v1/roles', roleRoutes);

describe('Role Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should route POST /api/v1/roles to create controller with correct middlewares', async () => {
        const response = await request(app).post('/api/v1/roles').send({ name: 'Admin' });
        
        expect(response.status).toBe(201);
        expect(authMiddlewareMock.isAuthenticated).toHaveBeenCalled();
        expect(roleControllerMock.create).toHaveBeenCalled();
    });

    it('should route GET /api/v1/roles to findAll controller with correct middlewares', async () => {
        const response = await request(app).get('/api/v1/roles');
        
        expect(response.status).toBe(200);
        expect(authMiddlewareMock.isAuthenticated).toHaveBeenCalled();
        expect(roleControllerMock.findAll).toHaveBeenCalled();
    });

    it('should route GET /api/v1/roles/:id to findById controller with correct middlewares', async () => {
        const response = await request(app).get('/api/v1/roles/123');
        
        expect(response.status).toBe(200);
        expect(authMiddlewareMock.isAuthenticated).toHaveBeenCalled();
        expect(roleControllerMock.findById).toHaveBeenCalled();
    });

    it('should route PUT /api/v1/roles/:id to update controller with correct middlewares', async () => {
        const response = await request(app).put('/api/v1/roles/123').send({ name: 'Updated' });
        
        expect(response.status).toBe(200);
        expect(authMiddlewareMock.isAuthenticated).toHaveBeenCalled();
        expect(roleControllerMock.update).toHaveBeenCalled();
    });

    it('should route DELETE /api/v1/roles/:id to delete controller with correct middlewares', async () => {
        const response = await request(app).delete('/api/v1/roles/123');
        
        expect(response.status).toBe(204);
        expect(authMiddlewareMock.isAuthenticated).toHaveBeenCalled();
        expect(roleControllerMock.delete).toHaveBeenCalled();
    });
});
