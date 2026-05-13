import { jest } from '@jest/globals';

const employeeRepositoryMock = {
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
};

const createEmployeeServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

jest.unstable_mockModule('../services/CreateEmployeeService.js', () => ({
    default: createEmployeeServiceMock
}));

const employeeController = (await import('./EmployeeController.js')).default;

describe('EmployeeController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create employee and return 201', async () => {
    const req = { body: { name: 'John', cpf: '123', companyId: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockEmployee = { id: 1, name: 'John', cpf: '123' };
    createEmployeeServiceMock.execute.mockResolvedValue(mockEmployee);
    await employeeController.create(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockEmployee);
  });

  it('should handle create error with 400', async () => {
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const error = new Error('Campos obrigatórios ausentes');
    createEmployeeServiceMock.execute.mockRejectedValue(error);
    await employeeController.create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: error.message });
  });

  it('should return all employees', async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const list = [{ id: 1, name: 'John' }];
    employeeRepositoryMock.findAll.mockResolvedValue(list);
    await employeeController.findAll(req, res);
    expect(res.json).toHaveBeenCalledWith(list);
  });

  it('should return employee by id', async () => {
    const req = { params: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const emp = { id: 1, name: 'John' };
    employeeRepositoryMock.findById.mockResolvedValue(emp);
    await employeeController.findById(req, res);
    expect(res.json).toHaveBeenCalledWith(emp);
  });

  it('should return 404 when employee not found', async () => {
    const req = { params: { id: 99 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    employeeRepositoryMock.findById.mockResolvedValue(null);
    await employeeController.findById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Funcionário não encontrado' });
  });

  it('should update employee', async () => {
    const req = { params: { id: 1 }, body: { name: 'Jane' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const updated = { id: 1, name: 'Jane' };
    employeeRepositoryMock.update.mockResolvedValue(updated);
    await employeeController.update(req, res);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('should delete employee', async () => {
    const req = { params: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const deleted = { id: 1 };
    employeeRepositoryMock.delete.mockResolvedValue(deleted);
    await employeeController.delete(req, res);
    expect(res.json).toHaveBeenCalledWith(deleted);
  });

  it('should return 404 on delete when not found', async () => {
    const req = { params: { id: 99 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const err = new Error('Not found');
    err.code = 'NOT_FOUND';
    employeeRepositoryMock.delete.mockRejectedValue(err);
    await employeeController.delete(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Funcionário não encontrado' });
  });
});

