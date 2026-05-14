import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const epiToRoleControllerMock = {
    link: jest.fn((req, res) => res.status(201).json({ id: 1 })),
    unlink: jest.fn((req, res) => res.status(200).json({ message: 'Success' })),
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

jest.unstable_mockModule('../controllers/EpiToRoleController.js', () => ({
    default: epiToRoleControllerMock
}));

jest.unstable_mockModule('../../../../shared/middlewares/auth.js', () => ({
    isAuthenticated: authMiddlewareMock.isAuthenticated
}));

jest.unstable_mockModule('../../../../shared/middlewares/rbac.js', () => ({
    authorize: rbacMiddlewareMock.authorize
}));

const epiToRoleRoutes = (await import('./epiToRole.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/roles-epis', epiToRoleRoutes);

describe('EpiToRole Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('POST /roles-epis deve chamar epiToRoleController.link', async () => {
        const res = await request(app).post('/roles-epis').send({ roleId: '1', caNumber: '11070', periodicityDays: 180 });
        expect(res.statusCode).toBe(201);
        expect(epiToRoleControllerMock.link).toHaveBeenCalled();
    });

    it('DELETE /roles-epis/:roleId/:epiId deve chamar epiToRoleController.unlink', async () => {
        const res = await request(app).delete('/roles-epis/1/2');
        expect(res.statusCode).toBe(200);
        expect(epiToRoleControllerMock.unlink).toHaveBeenCalled();
    });

    it('GET /roles-epis/:roleId deve chamar epiToRoleController.listByRole', async () => {
        const res = await request(app).get('/roles-epis/1');
        expect(res.statusCode).toBe(200);
        expect(epiToRoleControllerMock.listByRole).toHaveBeenCalled();
    });
});
