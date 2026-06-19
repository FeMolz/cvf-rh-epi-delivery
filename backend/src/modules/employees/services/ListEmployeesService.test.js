import { jest } from '@jest/globals';

const employeeRepositoryMock = { findManyComFiltro: jest.fn() };

jest.unstable_mockModule('../repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

const listEmployeesService = (await import('./ListEmployeesService.js')).default;

describe('ListEmployeesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar lista de funcionários ativos por padrão', async () => {
        const lista = [{ id: '1', name: 'João' }, { id: '2', name: 'Maria' }];
        employeeRepositoryMock.findManyComFiltro.mockResolvedValue(lista);

        const resultado = await listEmployeesService.execute();

        expect(employeeRepositoryMock.findManyComFiltro).toHaveBeenCalledWith({
            status: { in: ['ATIVO'] }
        });
        expect(resultado).toEqual(lista);
    });

    it('deve aplicar filtro informado', async () => {
        employeeRepositoryMock.findManyComFiltro.mockResolvedValue([]);

        await listEmployeesService.execute('afastados');

        expect(employeeRepositoryMock.findManyComFiltro).toHaveBeenCalledWith({
            status: { in: ['FERIAS', 'LICENCA_MATERNIDADE', 'LICENCA_MED'] }
        });
    });
});
