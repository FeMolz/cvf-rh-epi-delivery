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

  it('should throw NOT_FOUND when deleting already soft-deleted employee', async () => {
    prismaMock.employee.findUnique.mockResolvedValue({ id: 1, deletedAt: new Date() });
    await expect(repo.delete(1)).rejects.toMatchObject({ statusCode: 404 });
    expect(prismaMock.employee.update).not.toHaveBeenCalled();
  });

  it('should find many with custom filter', async () => {
    prismaMock.employee.findMany.mockResolvedValue([]);
    await repo.findManyComFiltro({ status: 'ATIVO' });
    expect(prismaMock.employee.findMany).toHaveBeenCalledWith({
      where: { status: 'ATIVO' },
      select: expect.any(Object),
      orderBy: [{ name: 'asc' }]
    });
  });

  it('should find employee by id for ficha export', async () => {
    prismaMock.employee.findUnique.mockResolvedValue({ id: 'f1' });
    const resultado = await repo.findByIdParaExportacaoFicha('f1');
    expect(resultado).toEqual({ id: 'f1' });
    expect(prismaMock.employee.findUnique).toHaveBeenCalledWith({
      where: { id: 'f1' },
      select: expect.any(Object)
    });
  });

  it('should find employees with expired temporary leave', async () => {
    const dataReferencia = new Date('2026-03-01');
    prismaMock.employee.findMany.mockResolvedValue([{ id: 'f1', status: 'AFASTADO' }]);
    const resultado = await repo.findManyComAfastamentoTemporarioExpirado(dataReferencia);
    expect(resultado).toEqual([{ id: 'f1', status: 'AFASTADO' }]);
    expect(prismaMock.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          leaveReturnDate: { not: null, lte: dataReferencia }
        })
      })
    );
  });

  it('should export active employees list by default', async () => {
    prismaMock.employee.findMany.mockResolvedValue([]);
    await repo.findManyParaExportacaoLista({ status: { in: ['ATIVO'] } });
    expect(prismaMock.employee.findMany).toHaveBeenCalledWith({
      where: { status: { in: ['ATIVO'] }, deletedAt: null },
      select: expect.any(Object),
      orderBy: [{ name: 'asc' }]
    });
  });

  it('should include dismissed employees when incluirDesligados is true', async () => {
    prismaMock.employee.findMany.mockResolvedValue([]);
    await repo.findManyParaExportacaoLista({ companyId: 'empresa-1' }, { incluirDesligados: true });
    expect(prismaMock.employee.findMany).toHaveBeenCalledWith({
      where: { companyId: 'empresa-1' },
      select: expect.any(Object),
      orderBy: [{ name: 'asc' }]
    });
  });

  it('should export fichas by ids regardless of deletedAt', async () => {
    prismaMock.employee.findMany.mockResolvedValue([]);
    await repo.findManyParaExportacaoFicha(['func-1', 'func-2']);
    expect(prismaMock.employee.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['func-1', 'func-2'] } },
      select: expect.any(Object),
      orderBy: [{ name: 'asc' }]
    });
  });

  it('should find many for departamento pessoal consulta', async () => {
    const where = { deletedAt: null, status: { in: ['ATIVO'] } };
    const orderBy = { admissionDate: 'desc' };
    const mockList = [{ id: '1', name: 'Ana' }];
    prismaMock.employee.findMany.mockResolvedValue(mockList);

    const resultado = await repo.findManyConsulta(where, orderBy);

    expect(prismaMock.employee.findMany).toHaveBeenCalledWith({
      where,
      select: expect.any(Object),
      orderBy: [orderBy, { name: 'asc' }]
    });
    expect(resultado).toEqual(mockList);
  });

  it('should find many for ferias listing', async () => {
    const where = { status: 'FERIAS', deletedAt: null };
    const mockList = [{ id: '1', name: 'Ana', leaveReturnDate: new Date('2026-08-01') }];
    prismaMock.employee.findMany.mockResolvedValue(mockList);

    const resultado = await repo.findManyFerias(where);

    expect(prismaMock.employee.findMany).toHaveBeenCalledWith({
      where,
      select: expect.any(Object),
      orderBy: [{ leaveReturnDate: 'asc' }]
    });
    expect(resultado).toEqual(mockList);
  });
});

