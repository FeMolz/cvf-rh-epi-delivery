import { jest } from '@jest/globals';

const epiDeliveryRepositoryMock = {
    findFuncionarioAtivoPorId: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiDeliveryRepository.js', () => ({
    default: epiDeliveryRepositoryMock
}));

const getEpiDeliveryEmployeeSituationService = (
    await import('./GetEpiDeliveryEmployeeSituationService.js')
).default;

describe('GetEpiDeliveryEmployeeSituationService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar situacao dos epis do funcionario', async () => {
        epiDeliveryRepositoryMock.findFuncionarioAtivoPorId.mockResolvedValue({
            id: 'f1',
            name: 'Ana',
            roleId: 'r1',
            role: {
                name: 'Operador',
                roleEpis: [
                    {
                        periodicityDays: 180,
                        epi: {
                            id: 'e1',
                            name: 'Capacete',
                            caNumber: '11070',
                            caExpirationDate: '2027-01-01'
                        }
                    }
                ]
            },
            epiDeliveries: []
        });

        const resultado = await getEpiDeliveryEmployeeSituationService.execute('f1');

        expect(resultado.employee.name).toBe('Ana');
        expect(resultado.epis).toHaveLength(1);
        expect(resultado.epis[0].situacao).toBe('PENDENTE');
    });

    it('deve lançar 404 quando funcionario nao for elegivel', async () => {
        epiDeliveryRepositoryMock.findFuncionarioAtivoPorId.mockResolvedValue(null);

        await expect(getEpiDeliveryEmployeeSituationService.execute('x')).rejects.toMatchObject({
            statusCode: 404
        });
    });
});
