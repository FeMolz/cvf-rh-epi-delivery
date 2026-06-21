import { jest } from '@jest/globals';

const employeeRepositoryMock = { findById: jest.fn() };

jest.unstable_mockModule('../repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

const findEmployeeByIdService = (await import('./FindEmployeeByIdService.js')).default;

describe('FindEmployeeByIdService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar funcionario quando encontrado', async () => {
        const funcionario = { id: '1', name: 'João', deletedAt: null };
        employeeRepositoryMock.findById.mockResolvedValue(funcionario);

        const resultado = await findEmployeeByIdService.execute('1');

        expect(resultado).toEqual(funcionario);
    });

    it('deve lancar erro 404 quando funcionario nao existe', async () => {
        employeeRepositoryMock.findById.mockResolvedValue(null);

        await expect(findEmployeeByIdService.execute('99')).rejects.toMatchObject({
            message: 'Funcionário não encontrado',
            statusCode: 404
        });
    });

    it('deve retornar funcionario desligado para permitir edicao administrativa', async () => {
        const funcionario = { id: '1', name: 'João', deletedAt: new Date(), status: 'DESLIGADO' };
        employeeRepositoryMock.findById.mockResolvedValue(funcionario);

        const resultado = await findEmployeeByIdService.execute('1');

        expect(resultado).toEqual(funcionario);
    });
});
