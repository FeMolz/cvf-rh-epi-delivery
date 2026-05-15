import { jest } from '@jest/globals';

const epiDeliveryReportRepositoryMock = {
    findArchiveByEmployeeId: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiDeliveryReportRepository.js', () => ({
    default: epiDeliveryReportRepositoryMock
}));

const listEmployeeEpiDeliveryReportArchiveService = (await import('./ListEmployeeEpiDeliveryReportArchiveService.js'))
    .default;

describe('ListEmployeeEpiDeliveryReportArchiveService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve exigir identificador do funcionario', async () => {
        await expect(listEmployeeEpiDeliveryReportArchiveService.execute('')).rejects.toThrow(
            'identificadorFuncionario e obrigatorio.'
        );
    });

    it('execute deve delegar ao repositorio', async () => {
        epiDeliveryReportRepositoryMock.findArchiveByEmployeeId.mockResolvedValue([{ id: 'r1' }]);
        const resultado = await listEmployeeEpiDeliveryReportArchiveService.execute('e1');
        expect(resultado).toEqual([{ id: 'r1' }]);
    });
});
