import { jest } from '@jest/globals';

const employeeRepositoryMock = {
    findUniqueByCpf: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn()
};

jest.unstable_mockModule('../repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

const createEmployeeService = (await import('./CreateEmployeeService.js')).default;

describe('CreateEmployeeService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create employee when data is valid', async () => {
    const reqData = {
      name: 'John',
      cpf: '12345678900',
      companyId: 1,
      roleId: 2,
      birthDate: '1990-06-15'
    };
    const mockCreated = { id: 1, ...reqData, status: 'ATIVO', birthDate: new Date('1990-06-15') };
    employeeRepositoryMock.create.mockResolvedValue(mockCreated);
    employeeRepositoryMock.findAll.mockResolvedValue([]);
    const result = await createEmployeeService.execute(reqData);
    expect(employeeRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John',
        cpf: '12345678900',
        companyId: 1,
        roleId: 2,
        status: 'ATIVO',
        birthDate: expect.any(Date)
      })
    );
    expect(result).toEqual(mockCreated);
  });

  it('should throw error when required fields are missing', async () => {
    await expect(createEmployeeService.execute({ name: 'John' })).rejects.toThrow('Campos obrigatórios ausentes');
  });

  it('should throw error when CPF already exists', async () => {
    const existing = [{ id: 2, cpf: '12345678900' }];
    employeeRepositoryMock.findAll.mockResolvedValue(existing);
    await expect(
      createEmployeeService.execute({
        name: 'Jane',
        cpf: '12345678900',
        companyId: 1,
        roleId: 2,
        birthDate: '1991-01-01'
      })
    ).rejects.toThrow('CPF já cadastrado no sistema');
  });

  it('should throw error when birthDate is missing', async () => {
    await expect(
      createEmployeeService.execute({ name: 'John', cpf: '12345678900', companyId: 1, roleId: 2 })
    ).rejects.toThrow('Campos obrigatórios ausentes');
  });

  it('should throw error when birthDate is invalid', async () => {
    await expect(
      createEmployeeService.execute({
        name: 'John',
        cpf: '12345678900',
        companyId: 1,
        roleId: 2,
        birthDate: 'data-invalida'
      })
    ).rejects.toThrow('Data de nascimento inválida.');
  });
});

