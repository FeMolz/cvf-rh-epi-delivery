import { jest } from '@jest/globals';

const employeeRepositoryMock = { findManyFerias: jest.fn() };

jest.unstable_mockModule('../repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

const listarFeriasFuncionariosService = (await import('./ListarFeriasFuncionariosService.js')).default;

describe('ListarFeriasFuncionariosService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar férias paginadas com ordenação padrão', async () => {
        const funcionarios = [
            { id: '1', name: 'Ana', leaveReturnDate: new Date('2026-08-01') },
            { id: '2', name: 'Bruno', leaveReturnDate: new Date('2026-07-15') }
        ];
        employeeRepositoryMock.findManyFerias.mockResolvedValue(funcionarios);

        const resultado = await listarFeriasFuncionariosService.execute({
            proximidade: 90,
            page: 1,
            pageSize: 25
        });

        expect(employeeRepositoryMock.findManyFerias).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'FERIAS' })
        );
        expect(resultado.total).toBe(2);
        expect(resultado.page).toBe(1);
        expect(resultado.pageSize).toBe(25);
        expect(resultado.items[0].id).toBe('2');
    });

    it('deve priorizar vencidos na ordenação vencidos_primeiro', async () => {
        const funcionarios = [
            { id: '1', name: 'Ana', leaveReturnDate: new Date('2026-08-01') },
            { id: '2', name: 'Bruno', leaveReturnDate: new Date('2020-01-01') }
        ];
        employeeRepositoryMock.findManyFerias.mockResolvedValue(funcionarios);

        const resultado = await listarFeriasFuncionariosService.execute({
            ordenacao: 'vencidos_primeiro',
            proximidade: 365,
            page: 1,
            pageSize: 50
        });

        expect(resultado.items[0].id).toBe('2');
        expect(resultado.items[1].id).toBe('1');
    });

    it('deve paginar resultados', async () => {
        const funcionarios = Array.from({ length: 30 }, (_, indice) => ({
            id: String(indice + 1),
            name: `Func ${indice + 1}`,
            leaveReturnDate: new Date(`2026-08-${String((indice % 28) + 1).padStart(2, '0')}`)
        }));
        employeeRepositoryMock.findManyFerias.mockResolvedValue(funcionarios);

        const resultado = await listarFeriasFuncionariosService.execute({
            proximidade: 365,
            page: 2,
            pageSize: 25
        });

        expect(resultado.items).toHaveLength(5);
        expect(resultado.total).toBe(30);
    });
});
