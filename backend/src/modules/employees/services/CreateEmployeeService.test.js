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

const CPF_VALIDO = '529.982.247-25';
const TELEFONE_VALIDO = '(11) 98888-7777';

describe('CreateEmployeeService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create employee when data is valid', async () => {
        const reqData = {
            name: 'John',
            cpf: CPF_VALIDO,
            email: 'john@empresa.com',
            telefone: TELEFONE_VALIDO,
            companyId: 1,
            roleId: 2,
            setorId: '30303030-3030-3030-3030-303030303030',
            birthDate: '1990-06-15',
            valeTransporte: true
        };
        const mockCreated = { id: 1, ...reqData, status: 'ATIVO', birthDate: new Date('1990-06-15') };
        employeeRepositoryMock.create.mockResolvedValue(mockCreated);
        employeeRepositoryMock.findAll.mockResolvedValue([]);
        const result = await createEmployeeService.execute(reqData);
        expect(employeeRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'John',
                cpf: CPF_VALIDO,
                email: 'john@empresa.com',
                telefone: TELEFONE_VALIDO,
                companyId: 1,
                roleId: 2,
                setorId: '30303030-3030-3030-3030-303030303030',
                status: 'ATIVO',
                birthDate: expect.any(Date),
                valeTransporte: true
            })
        );
        expect(result).toEqual(mockCreated);
    });

    it('should throw error when required fields are missing', async () => {
        await expect(createEmployeeService.execute({ name: 'John' })).rejects.toThrow(
            'Campos obrigatórios ausentes'
        );
    });

    it('should throw error when CPF format is invalid', async () => {
        employeeRepositoryMock.findAll.mockResolvedValue([]);
        await expect(
            createEmployeeService.execute({
                name: 'Jane',
                cpf: '12345678900',
                email: 'jane@empresa.com',
                telefone: TELEFONE_VALIDO,
                companyId: 1,
                roleId: 2,
                setorId: '10101010-1010-1010-1010-101010101010',
                birthDate: '1991-01-01'
            })
        ).rejects.toThrow('CPF inválido. Use o formato xxx.xxx.xxx-xx (11 dígitos com pontos e hífen).');
    });

    it('should throw error when CPF already exists', async () => {
        const existing = [{ id: 2, cpf: CPF_VALIDO, email: 'outro@empresa.com' }];
        employeeRepositoryMock.findAll.mockResolvedValue(existing);
        await expect(
            createEmployeeService.execute({
                name: 'Jane',
                cpf: CPF_VALIDO,
                email: 'jane@empresa.com',
                telefone: TELEFONE_VALIDO,
                companyId: 1,
                roleId: 2,
                setorId: '10101010-1010-1010-1010-101010101010',
                birthDate: '1991-01-01'
            })
        ).rejects.toThrow('CPF já cadastrado no sistema');
    });

    it('should throw error when email is invalid', async () => {
        employeeRepositoryMock.findAll.mockResolvedValue([]);
        await expect(
            createEmployeeService.execute({
                name: 'Jane',
                cpf: CPF_VALIDO,
                email: 'email-invalido',
                telefone: TELEFONE_VALIDO,
                companyId: 1,
                roleId: 2,
                setorId: '10101010-1010-1010-1010-101010101010',
                birthDate: '1991-01-01'
            })
        ).rejects.toThrow('E-mail inválido.');
    });

    it('should throw error when telefone is invalid', async () => {
        employeeRepositoryMock.findAll.mockResolvedValue([]);
        await expect(
            createEmployeeService.execute({
                name: 'Jane',
                cpf: CPF_VALIDO,
                email: 'jane@empresa.com',
                telefone: '11977776666',
                companyId: 1,
                roleId: 2,
                setorId: '10101010-1010-1010-1010-101010101010',
                birthDate: '1991-01-01'
            })
        ).rejects.toThrow('Telefone inválido.');
    });

    it('should throw error when email already exists', async () => {
        employeeRepositoryMock.findAll.mockResolvedValue([
            { id: 2, cpf: '390.533.447-05', email: 'jane@empresa.com' }
        ]);
        await expect(
            createEmployeeService.execute({
                name: 'Jane',
                cpf: CPF_VALIDO,
                email: 'jane@empresa.com',
                telefone: TELEFONE_VALIDO,
                companyId: 1,
                roleId: 2,
                setorId: '10101010-1010-1010-1010-101010101010',
                birthDate: '1991-01-01'
            })
        ).rejects.toThrow('E-mail já cadastrado no sistema');
    });

    it('should throw error when birthDate is missing', async () => {
        await expect(
            createEmployeeService.execute({ name: 'John', cpf: CPF_VALIDO, companyId: 1, roleId: 2 })
        ).rejects.toThrow('Campos obrigatórios ausentes');
    });

    it('should throw error when birthDate is invalid', async () => {
        await expect(
            createEmployeeService.execute({
                name: 'John',
                cpf: CPF_VALIDO,
                email: 'john@empresa.com',
                telefone: TELEFONE_VALIDO,
                companyId: 1,
                roleId: 2,
                setorId: '10101010-1010-1010-1010-101010101010',
                birthDate: 'data-invalida'
            })
        ).rejects.toThrow('Data de nascimento inválida.');
    });
});
