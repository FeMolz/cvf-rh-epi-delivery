import { jest } from '@jest/globals';

const employeeRepositoryMock = {
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn()
};

jest.unstable_mockModule('../repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

const updateEmployeeService = (await import('./UpdateEmployeeService.js')).default;

const CPF_VALIDO = '529.982.247-25';
const TELEFONE_VALIDO = '(11) 98888-7777';

describe('UpdateEmployeeService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve atualizar funcionário com dados válidos', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({ id: '1', deletedAt: null });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', telefone: TELEFONE_VALIDO });

        const resultado = await updateEmployeeService.execute('1', { telefone: TELEFONE_VALIDO });

        expect(employeeRepositoryMock.update).toHaveBeenCalledWith('1', { telefone: TELEFONE_VALIDO });
        expect(resultado).toEqual({ id: '1', telefone: TELEFONE_VALIDO });
    });

    it('deve retornar NOT_FOUND quando funcionário não existe', async () => {
        employeeRepositoryMock.findById.mockResolvedValue(null);

        await expect(updateEmployeeService.execute('99', { name: 'Teste' })).rejects.toMatchObject({
            code: 'NOT_FOUND'
        });
    });

    it('deve rejeitar CPF inválido na atualização', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({ id: '1', deletedAt: null });

        await expect(updateEmployeeService.execute('1', { cpf: '123' })).rejects.toThrow(
            'CPF inválido. Use o formato xxx.xxx.xxx-xx (11 dígitos com pontos e hífen).'
        );
    });
});
