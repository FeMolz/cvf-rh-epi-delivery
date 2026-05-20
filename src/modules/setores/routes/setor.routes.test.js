import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

jest.unstable_mockModule('../../../shared/middlewares/auth.js', () => ({
    isAuthenticated: jest.fn((request, response, next) => next())
}));

jest.unstable_mockModule('../controllers/SetorController.js', () => ({
    default: {
        findAll: jest.fn((request, response) =>
            response.status(200).json([{ id: '1', nome: 'ADMINISTRATIVO' }])
        )
    }
}));

const { isAuthenticated } = await import('../../../shared/middlewares/auth.js');
const setorController = (await import('../controllers/SetorController.js')).default;
const setorRoutes = (await import('./setor.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/api/v1/setores', setorRoutes);

describe('Setor Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET /api/v1/setores - deve chamar isAuthenticated e o controller', async () => {
        const response = await request(app).get('/api/v1/setores');

        expect(isAuthenticated).toHaveBeenCalled();
        expect(setorController.findAll).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: '1', nome: 'ADMINISTRATIVO' }]);
    });
});
