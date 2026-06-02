import { jest } from '@jest/globals';

const employeeRepositoryMock = { findAll: jest.fn() };

jest.unstable_mockModule('../repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

const listEmployeesService = (await import('./ListEmployeesService.js')).default;

describe('ListEmployeesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar lista de funcionarios ativos', async () => {
        const lista = [{ id: '1', name: 'João' }, { id: '2', name: 'Maria' }];
        employeeRepositoryMock.findAll.mockResolvedValue(lista);

        const resultado = await listEmployeesService.execute();

        expect(employeeRepositoryMock.findAll).toHaveBeenCalled();
        expect(resultado).toEqual(lista);
    });

    it('deve retornar lista vazia', async () => {
        employeeRepositoryMock.findAll.mockResolvedValue([]);

        const resultado = await listEmployeesService.execute();

        expect(resultado).toEqual([]);
    });
});
