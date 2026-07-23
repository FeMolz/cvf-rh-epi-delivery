import { jest } from '@jest/globals';

const employeeRepositoryMock = { findManyConsulta: jest.fn() };

jest.unstable_mockModule('../repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

const consultarFuncionariosService = (await import('./ConsultarFuncionariosService.js')).default;

describe('ConsultarFuncionariosService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve consultar funcionários ativos por padrão ordenados por admissão recente', async () => {
        const lista = [{ id: '1', name: 'João' }];
        employeeRepositoryMock.findManyConsulta.mockResolvedValue(lista);

        const resultado = await consultarFuncionariosService.execute();

        expect(employeeRepositoryMock.findManyConsulta).toHaveBeenCalledWith(
            expect.objectContaining({
                deletedAt: null,
                status: { in: ['ATIVO'] }
            }),
            { admissionDate: 'desc' }
        );
        expect(resultado).toEqual(lista);
    });

    it('deve aplicar filtros de empresa, situação e admissão', async () => {
        employeeRepositoryMock.findManyConsulta.mockResolvedValue([]);

        await consultarFuncionariosService.execute({
            companyId: 'empresa-1',
            situacao: 'demitidos',
            admissaoDe: '2024-01-01',
            admissaoAte: '2024-12-31',
            ordenacaoAdmissao: 'antigas'
        });

        expect(employeeRepositoryMock.findManyConsulta).toHaveBeenCalledWith(
            expect.objectContaining({
                companyId: 'empresa-1',
                status: { in: ['INATIVO', 'DESLIGADO', 'RESCINDIDO', 'APOSENTADO'] },
                admissionDate: expect.objectContaining({
                    gte: expect.any(Date),
                    lte: expect.any(Date)
                })
            }),
            { admissionDate: 'asc' }
        );

        const whereConsulta = employeeRepositoryMock.findManyConsulta.mock.calls[0][0];
        expect(whereConsulta.deletedAt).toBeUndefined();
    });

    it('deve aplicar busca por nome ou cpf', async () => {
        employeeRepositoryMock.findManyConsulta.mockResolvedValue([]);

        await consultarFuncionariosService.execute({ busca: 'Maria' });

        expect(employeeRepositoryMock.findManyConsulta).toHaveBeenCalledWith(
            expect.objectContaining({
                AND: [
                    expect.objectContaining({
                        OR: expect.arrayContaining([
                            { name: { contains: 'Maria', mode: 'insensitive' } }
                        ])
                    })
                ]
            }),
            { admissionDate: 'desc' }
        );
    });
});
