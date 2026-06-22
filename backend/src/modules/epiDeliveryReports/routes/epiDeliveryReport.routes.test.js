import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const controllerMock = {
    create: jest.fn((req, res) => res.status(201).json({ id: 'rel1' })),
    list: jest.fn((req, res) => res.status(200).json({ itens: [], pagina: 1, limite: 20, totalItens: 0, totalPaginas: 1 })),
    preview: jest.fn((req, res) => res.status(200).json({ entregas: [] })),
    listEmployeesEligibleForEmission: jest.fn((req, res) => res.status(200).json([])),
    listEmployeesWithReports: jest.fn((req, res) => res.status(200).json([])),
    listPending: jest.fn((req, res) => res.status(200).json([])),
    listArchiveByEmployee: jest.fn((req, res) => res.status(200).json([])),
    updateFlags: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
    downloadPdf: jest.fn((req, res) => res.status(200).send('pdf'))
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

jest.unstable_mockModule('../controllers/EpiDeliveryReportController.js', () => ({
    default: controllerMock
}));

jest.unstable_mockModule('../../../shared/middlewares/auth.js', () => ({
    isAuthenticated: authMiddlewareMock.isAuthenticated
}));

jest.unstable_mockModule('../../../shared/middlewares/rbac.js', () => ({
    authorize: rbacMiddlewareMock.authorize
}));

const epiDeliveryReportRoutes = (await import('./epiDeliveryReport.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/epi-delivery-reports', epiDeliveryReportRoutes);

describe('EpiDeliveryReport Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('POST /epi-delivery-reports deve criar relatorio', async () => {
        const resposta = await request(app).post('/epi-delivery-reports').send({
            employeeId: 'e1',
            periodoInicio: '2026-01-01',
            periodoFim: '2026-01-31'
        });

        expect(resposta.statusCode).toBe(201);
        expect(controllerMock.create).toHaveBeenCalled();
    });

    it('GET /epi-delivery-reports deve listar relatorios com filtros', async () => {
        const resposta = await request(app).get('/epi-delivery-reports?pagina=1&limite=10');

        expect(resposta.statusCode).toBe(200);
        expect(controllerMock.list).toHaveBeenCalled();
    });

    it('GET /epi-delivery-reports/preview deve retornar preview do relatorio', async () => {
        const resposta = await request(app).get(
            '/epi-delivery-reports/preview?employeeId=e1&periodoInicio=2026-01-01&periodoFim=2026-01-31'
        );

        expect(resposta.statusCode).toBe(200);
        expect(controllerMock.preview).toHaveBeenCalled();
    });

    it('GET /epi-delivery-reports/employees/eligible-for-emission deve listar elegiveis', async () => {
        const resposta = await request(app).get('/epi-delivery-reports/employees/eligible-for-emission');

        expect(resposta.statusCode).toBe(200);
        expect(controllerMock.listEmployeesEligibleForEmission).toHaveBeenCalled();
    });

    it('GET /epi-delivery-reports/employees/with-reports deve listar funcionarios com historico', async () => {
        const resposta = await request(app).get('/epi-delivery-reports/employees/with-reports');

        expect(resposta.statusCode).toBe(200);
        expect(controllerMock.listEmployeesWithReports).toHaveBeenCalled();
    });

    it('GET /epi-delivery-reports/pending deve listar pendentes', async () => {
        const resposta = await request(app).get('/epi-delivery-reports/pending');

        expect(resposta.statusCode).toBe(200);
        expect(controllerMock.listPending).toHaveBeenCalled();
    });

    it('GET /epi-delivery-reports/employee/:employeeId/archive deve listar arquivo', async () => {
        const resposta = await request(app).get('/epi-delivery-reports/employee/e1/archive');

        expect(resposta.statusCode).toBe(200);
        expect(controllerMock.listArchiveByEmployee).toHaveBeenCalled();
    });

    it('PATCH /epi-delivery-reports/:id/flags deve atualizar flags', async () => {
        const resposta = await request(app)
            .patch('/epi-delivery-reports/rel1/flags')
            .send({ foiImpresso: true });

        expect(resposta.statusCode).toBe(200);
        expect(controllerMock.updateFlags).toHaveBeenCalled();
    });

    it('GET /epi-delivery-reports/:id/pdf deve baixar pdf', async () => {
        const resposta = await request(app).get('/epi-delivery-reports/rel1/pdf');

        expect(resposta.statusCode).toBe(200);
        expect(controllerMock.downloadPdf).toHaveBeenCalled();
    });
});
