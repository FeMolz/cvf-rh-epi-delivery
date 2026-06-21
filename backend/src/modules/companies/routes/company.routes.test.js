import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const companyControllerMock = {
    findAll: jest.fn((req, res) => res.status(200).json([{ id: '1', name: 'Empresa Teste' }])),
    create: jest.fn((req, res) => res.status(201).send()),
    findById: jest.fn((req, res) => res.status(200).send()),
    update: jest.fn((req, res) => res.status(200).send()),
    delete: jest.fn((req, res) => res.status(204).send())
};

const authMiddlewareMock = {
    isAuthenticated: jest.fn((requisicao, _resposta, proximo) => {
        requisicao.user = { role: 'ADMIN' };
        return proximo();
    })
};

const rbacMiddlewareMock = {
    authorize: jest.fn(() => (_requisicao, _resposta, proximo) => proximo())
};

jest.unstable_mockModule('../../../shared/middlewares/auth.js', () => ({
    isAuthenticated: authMiddlewareMock.isAuthenticated
}));

jest.unstable_mockModule('../../../shared/middlewares/rbac.js', () => ({
    authorize: rbacMiddlewareMock.authorize
}));

jest.unstable_mockModule('../controllers/CompanyController.js', () => ({
    default: companyControllerMock
}));

const companyRoutes = (await import('./company.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/api/v1/companies', companyRoutes);

describe('Company Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET /api/v1/companies - deve chamar isAuthenticated e findAll sem authorize', async () => {
        const response = await request(app).get('/api/v1/companies');

        expect(authMiddlewareMock.isAuthenticated).toHaveBeenCalled();
        expect(companyControllerMock.findAll).toHaveBeenCalled();
        expect(response.status).toBe(200);
    });

    it('POST /api/v1/companies - deve chamar create controller', async () => {
        const response = await request(app).post('/api/v1/companies').send({ name: 'Nova', cnpj: '1' });

        expect(response.status).toBe(201);
        expect(companyControllerMock.create).toHaveBeenCalled();
    });

    it('GET /api/v1/companies/:id - deve chamar findById', async () => {
        const response = await request(app).get('/api/v1/companies/123');

        expect(response.status).toBe(200);
        expect(companyControllerMock.findById).toHaveBeenCalled();
    });

    it('PUT /api/v1/companies/:id - deve chamar update', async () => {
        const response = await request(app).put('/api/v1/companies/123').send({ name: 'Atualizada', cnpj: '2' });

        expect(response.status).toBe(200);
        expect(companyControllerMock.update).toHaveBeenCalled();
    });

    it('DELETE /api/v1/companies/:id - deve chamar delete', async () => {
        const response = await request(app).delete('/api/v1/companies/123');

        expect(response.status).toBe(204);
        expect(companyControllerMock.delete).toHaveBeenCalled();
    });
});
