import { jest } from '@jest/globals';

const epiDeliveryReportRepositoryMock = {
    findFuncionariosComHistoricoEmissoes: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiDeliveryReportRepository.js', () => ({
    default: epiDeliveryReportRepositoryMock
}));

const listEmployeesWithReportHistoryService = (
    await import('./ListEmployeesWithReportHistoryService.js')
).default;

describe('ListEmployeesWithReportHistoryService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve listar funcionarios com historico de emissoes', async () => {
        epiDeliveryReportRepositoryMock.findFuncionariosComHistoricoEmissoes.mockResolvedValue([
            { id: 'e1', name: 'Ana', roleName: 'Pedreiro', totalEmissoes: 2 }
        ]);

        const resultado = await listEmployeesWithReportHistoryService.execute();

        expect(resultado[0].totalEmissoes).toBe(2);
    });
});
