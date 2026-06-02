import { jest } from '@jest/globals';

const employeeRepositoryMock = {
    findById: jest.fn(),
    delete: jest.fn()
};

jest.unstable_mockModule('../repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

const deleteEmployeeService = (await import('./DeleteEmployeeService.js')).default;

describe('DeleteEmployeeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve excluir funcionario quando existe e nao esta deletado', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({ id: '1', deletedAt: null });
        employeeRepositoryMock.delete.mockResolvedValue({ id: '1', status: 'DESLIGADO' });

        const resultado = await deleteEmployeeService.execute('1');

        expect(employeeRepositoryMock.delete).toHaveBeenCalledWith('1');
        expect(resultado.status).toBe('DESLIGADO');
    });

    it('deve lancar erro 404 quando funcionario nao existe', async () => {
        employeeRepositoryMock.findById.mockResolvedValue(null);

        await expect(deleteEmployeeService.execute('99')).rejects.toMatchObject({
            message: 'Funcionário não encontrado',
            statusCode: 404
        });
    });

    it('deve lancar erro 404 quando funcionario ja foi excluido', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: new Date()
        });

        await expect(deleteEmployeeService.execute('1')).rejects.toMatchObject({
            statusCode: 404
        });

        expect(employeeRepositoryMock.delete).not.toHaveBeenCalled();
    });
});
