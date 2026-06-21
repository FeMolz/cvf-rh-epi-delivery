import { jest } from '@jest/globals';

const prismaMock = {
    employee: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const EmployeeRepository = (await import('./EmployeeRepository.js')).default;

describe('EmployeeRepository', () => {
  const repo = EmployeeRepository;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an employee and return selected fields', async () => {
    const data = {
      name: 'John',
      cpf: '123',
      birthDate: new Date('1990-01-01'),
      status: 'ATIVO',
      admissionDate: new Date(),
      companyId: 1
    };
    const mockResult = { id: 1, ...data };
    prismaMock.employee.create.mockResolvedValue(mockResult);
    const result = await repo.create(data);
    expect(prismaMock.employee.create).toHaveBeenCalledWith({ data, select: expect.any(Object) });
    expect(result).toEqual(mockResult);
  });

  it('should find all employees', async () => {
    const mockList = [{ id: 1, name: 'John' }];
    prismaMock.employee.findMany.mockResolvedValue(mockList);
    const result = await repo.findAll();
    expect(prismaMock.employee.findMany).toHaveBeenCalledWith({
      where: {},
      select: expect.any(Object),
      orderBy: [{ name: 'asc' }]
    });
    expect(result).toEqual(mockList);
  });

  it('should find employee by id', async () => {
    const mockEmp = { id: 1, name: 'John' };
    prismaMock.employee.findUnique.mockResolvedValue(mockEmp);
    const result = await repo.findById(1);
    expect(prismaMock.employee.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, select: expect.any(Object) });
    expect(result).toEqual(mockEmp);
  });

  it('should update employee', async () => {
    const data = { name: 'Jane' };
    const mockUpdated = { id: 1, name: 'Jane' };
    prismaMock.employee.update.mockResolvedValue(mockUpdated);
    const result = await repo.update(1, data);
    expect(prismaMock.employee.update).toHaveBeenCalledWith({ where: { id: 1 }, data, select: expect.any(Object) });
    expect(result).toEqual(mockUpdated);
  });

  it('should soft delete employee when exists', async () => {
    const mockDeleted = { id: 1, deletedAt: new Date() };
    prismaMock.employee.findUnique.mockResolvedValue({ id: 1, deletedAt: null });
    prismaMock.employee.update.mockResolvedValue(mockDeleted);
    const result = await repo.delete(1);
    expect(prismaMock.employee.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, select: expect.any(Object) });
    expect(prismaMock.employee.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { deletedAt: expect.any(Date), status: 'DESLIGADO' } });
    expect(result).toEqual(mockDeleted);
  });

  it('should throw NOT_FOUND error when deleting non‑existent employee', async () => {
    prismaMock.employee.findUnique.mockResolvedValue(null);
    await expect(repo.delete(99)).rejects.toMatchObject({ statusCode: 404 });
  });
});

