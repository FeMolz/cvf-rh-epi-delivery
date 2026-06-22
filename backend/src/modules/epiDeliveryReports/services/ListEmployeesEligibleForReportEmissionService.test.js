import { jest } from '@jest/globals';

const epiDeliveryReportRepositoryMock = {
    findFuncionariosElegiveisEmissaoRelatorio: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiDeliveryReportRepository.js', () => ({
    default: epiDeliveryReportRepositoryMock
}));

const listEmployeesEligibleForReportEmissionService = (
    await import('./ListEmployeesEligibleForReportEmissionService.js')
).default;

describe('ListEmployeesEligibleForReportEmissionService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve listar funcionarios elegiveis para emissao', async () => {
        epiDeliveryReportRepositoryMock.findFuncionariosElegiveisEmissaoRelatorio.mockResolvedValue([
            { id: 'e1', name: 'Ana', roleName: 'Pedreiro' }
        ]);

        const resultado = await listEmployeesEligibleForReportEmissionService.execute();

        expect(resultado).toHaveLength(1);
        expect(resultado[0].name).toBe('Ana');
    });
});
