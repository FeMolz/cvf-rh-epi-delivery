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
    const reqData = { name: 'John', cpf: '12345678900', companyId: 1 };
    const mockCreated = { id: 1, ...reqData, status: 'ATIVO' };
    employeeRepositoryMock.create.mockResolvedValue(mockCreated);
    employeeRepositoryMock.findAll.mockResolvedValue([]);
    const result = await createEmployeeService.execute(reqData);
    expect(employeeRepositoryMock.create).toHaveBeenCalledWith(expect.objectContaining(reqData));
    expect(result).toEqual(mockCreated);
  });

  it('should throw error when required fields are missing', async () => {
    await expect(createEmployeeService.execute({ name: 'John' })).rejects.toThrow('Campos obrigatórios ausentes');
  });

  it('should throw error when CPF already exists', async () => {
    const existing = [{ id: 2, cpf: '12345678900' }];
    employeeRepositoryMock.findAll.mockResolvedValue(existing);
    await expect(
      createEmployeeService.execute({ name: 'Jane', cpf: '12345678900', companyId: 1 })
    ).rejects.toThrow('CPF já cadastrado no sistema');
  });
});

