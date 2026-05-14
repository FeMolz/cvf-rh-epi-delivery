import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const epiControllerMock = {
    findByCa: jest.fn((req, res) => res.status(200).json({ id: 1 })),
    findAllLocal: jest.fn((req, res) => res.status(200).json([{ id: 1 }])),
    changePeriodicity: jest.fn((req, res) => res.status(200).json({ id: 1 }))
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

jest.unstable_mockModule('../controllers/EpiController.js', () => ({
    default: epiControllerMock
}));

jest.unstable_mockModule('../../../shared/middlewares/auth.js', () => ({
    isAuthenticated: authMiddlewareMock.isAuthenticated
}));

jest.unstable_mockModule('../../../shared/middlewares/rbac.js', () => ({
    authorize: rbacMiddlewareMock.authorize
}));

const epiRoutes = (await import('./epi.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/epis', epiRoutes);

describe('Epi Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('GET /epis/:caNumber deve chamar epiController.findByCa', async () => {
        const res = await request(app).get('/epis/11070');
        expect(res.statusCode).toBe(200);
        expect(epiControllerMock.findByCa).toHaveBeenCalled();
    });

    it('GET /epis deve chamar epiController.findAllLocal', async () => {
        const res = await request(app).get('/epis');
        expect(res.statusCode).toBe(200);
        expect(epiControllerMock.findAllLocal).toHaveBeenCalled();
    });

    it('PUT /epis/periodicity deve chamar epiController.changePeriodicity', async () => {
        const res = await request(app)
            .put('/epis/periodicity')
            .send({ roleId: '1', epiId: '2', newPeriodicityDays: 60 });
        expect(res.statusCode).toBe(200);
        expect(epiControllerMock.changePeriodicity).toHaveBeenCalled();
    });
});
