import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const employeeControllerMock = {
    create: jest.fn((req, res) => res.status(201).json({ id: '1' })),
    findAll: jest.fn((req, res) => res.status(200).json([{ id: '1' }])),
    consultar: jest.fn((req, res) => res.status(200).json([{ id: '1' }])),
    listarFerias: jest.fn((req, res) => res.status(200).json({ items: [], total: 0 })),
    exportarLista: jest.fn((req, res) => res.status(200).send(Buffer.from('xlsx'))),
    exportarFuncionarioCompleto: jest.fn((req, res) => res.status(200).send(Buffer.from('xlsx'))),
    findById: jest.fn((req, res) => res.status(200).json({ id: '1' })),
    update: jest.fn((req, res) => res.status(200).json({ id: '1' })),
    delete: jest.fn((req, res) => res.status(200).json({ id: '1' }))
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

jest.unstable_mockModule('../controllers/EmployeeController.js', () => ({
    default: employeeControllerMock
}));

jest.unstable_mockModule('../../../../src/shared/middlewares/auth.js', () => ({
    isAuthenticated: authMiddlewareMock.isAuthenticated
}));

jest.unstable_mockModule('../../../../src/shared/middlewares/rbac.js', () => ({
    authorize: rbacMiddlewareMock.authorize
}));

// We must import the module dynamically after mocking
const employeeRoutes = (await import('./employee.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/employees', employeeRoutes);

describe('Employee Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('POST /employees deve chamar employeeController.create', async () => {
        const res = await request(app)
            .post('/employees')
            .send({ name: 'Empregado 1', email: 'emp@teste.com' });
        
        expect(res.statusCode).toBe(201);
        expect(employeeControllerMock.create).toHaveBeenCalled();
    });

    it('GET /employees deve chamar employeeController.findAll', async () => {
        const res = await request(app).get('/employees');
        
        expect(res.statusCode).toBe(200);
        expect(employeeControllerMock.findAll).toHaveBeenCalled();
    });

    it('GET /employees/consulta deve chamar employeeController.consultar', async () => {
        const res = await request(app).get('/employees/consulta?situacao=ativos');

        expect(res.statusCode).toBe(200);
        expect(employeeControllerMock.consultar).toHaveBeenCalled();
    });

    it('GET /employees/ferias deve chamar employeeController.listarFerias', async () => {
        const res = await request(app).get('/employees/ferias');

        expect(res.statusCode).toBe(200);
        expect(employeeControllerMock.listarFerias).toHaveBeenCalled();
    });

    it('GET /employees/export/lista deve chamar exportarLista', async () => {
        const res = await request(app).get('/employees/export/lista?filtro=ativos');

        expect(res.statusCode).toBe(200);
        expect(employeeControllerMock.exportarLista).toHaveBeenCalled();
    });

    it('GET /employees/:id/export deve chamar exportarFuncionarioCompleto', async () => {
        const res = await request(app).get('/employees/1/export');

        expect(res.statusCode).toBe(200);
        expect(employeeControllerMock.exportarFuncionarioCompleto).toHaveBeenCalled();
    });

    it('GET /employees/:id deve chamar employeeController.findById', async () => {
        const res = await request(app).get('/employees/1');
        
        expect(res.statusCode).toBe(200);
        expect(employeeControllerMock.findById).toHaveBeenCalled();
    });

    it('PUT /employees/:id deve chamar employeeController.update', async () => {
        const res = await request(app)
            .put('/employees/1')
            .send({ name: 'Empregado Atualizado' });
        
        expect(res.statusCode).toBe(200);
        expect(employeeControllerMock.update).toHaveBeenCalled();
    });

    it('DELETE /employees/:id deve chamar employeeController.delete', async () => {
        const res = await request(app).delete('/employees/1');
        
        expect(res.statusCode).toBe(200);
        expect(employeeControllerMock.delete).toHaveBeenCalled();
    });
});
