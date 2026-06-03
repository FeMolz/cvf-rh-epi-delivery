import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// 1. Mocks dos middlewares e controller
jest.unstable_mockModule('../../../shared/middlewares/auth.js', () => ({
  isAuthenticated: jest.fn((requisicao, _resposta, proximo) => {
    requisicao.user = { role: 'ADMIN' };
    return proximo();
  })
}));

jest.unstable_mockModule('../../../shared/middlewares/rbac.js', () => ({
  authorize: jest.fn(() => (_requisicao, _resposta, proximo) => proximo())
}));

jest.unstable_mockModule('../controllers/CompanyController.js', () => ({
  default: {
    findAll: jest.fn((req, res) => res.status(200).json([{ id: '1', name: 'Empresa Teste' }]))
  }
}));

// 2. Importações dinâmicas após os mocks
const { isAuthenticated } = await import('../../../shared/middlewares/auth.js');
const companyController = (await import('../controllers/CompanyController.js')).default;
const companyRoutes = (await import('./company.routes.js')).default;

// 3. Setup do App para o Supertest
const app = express();
app.use(express.json());
app.use('/api/v1/companies', companyRoutes);

describe('Company Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/v1/companies - should call isAuthenticated and controller', async () => {
    const response = await request(app).get('/api/v1/companies');

    expect(isAuthenticated).toHaveBeenCalled();
    expect(companyController.findAll).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: '1', name: 'Empresa Teste' }]);
  });
});
