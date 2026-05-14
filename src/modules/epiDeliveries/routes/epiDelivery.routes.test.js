import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const epiDeliveryControllerMock = {
    create: jest.fn((req, res) => res.status(201).json({ count: 2 })),
    listByEmployee: jest.fn((req, res) => res.status(200).json([{ id: 'del1' }]))
};

const authMiddlewareMock = {
    isAuthenticated: jest.fn((req, res, next) => {
        req.user = { id: 'admin1', role: 'ALMOXARIFADO' };
        next();
    })
};

const rbacMiddlewareMock = {
    authorize: jest.fn(() => (req, res, next) => next())
};

jest.unstable_mockModule('../controllers/EpiDeliveryController.js', () => ({
    default: epiDeliveryControllerMock
}));

jest.unstable_mockModule('../../../shared/middlewares/auth.js', () => ({
    isAuthenticated: authMiddlewareMock.isAuthenticated
}));

jest.unstable_mockModule('../../../shared/middlewares/rbac.js', () => ({
    authorize: rbacMiddlewareMock.authorize
}));

const epiDeliveryRoutes = (await import('./epiDelivery.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/epi-deliveries', epiDeliveryRoutes);

describe('EpiDelivery Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('POST /epi-deliveries deve chamar epiDeliveryController.create', async () => {
        const res = await request(app)
            .post('/epi-deliveries')
            .send({ employeeId: '1', caNumbers: ['11070', '4280'] });
            
        expect(res.statusCode).toBe(201);
        expect(epiDeliveryControllerMock.create).toHaveBeenCalled();
    });

    it('GET /epi-deliveries/employee/:employeeId deve chamar listByEmployee', async () => {
        const res = await request(app).get('/epi-deliveries/employee/1');
        
        expect(res.statusCode).toBe(200);
        expect(epiDeliveryControllerMock.listByEmployee).toHaveBeenCalled();
    });
});
