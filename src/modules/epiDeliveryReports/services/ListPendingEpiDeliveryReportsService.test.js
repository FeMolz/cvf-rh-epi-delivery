import { jest } from '@jest/globals';

const epiDeliveryReportRepositoryMock = {
    findAllPendingSignatureOrdered: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiDeliveryReportRepository.js', () => ({
    default: epiDeliveryReportRepositoryMock
}));

const listPendingEpiDeliveryReportsService = (await import('./ListPendingEpiDeliveryReportsService.js')).default;

describe('ListPendingEpiDeliveryReportsService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('execute deve delegar ao repositorio', async () => {
        epiDeliveryReportRepositoryMock.findAllPendingSignatureOrdered.mockResolvedValue([{ id: 'r1' }]);
        const resultado = await listPendingEpiDeliveryReportsService.execute();
        expect(resultado).toEqual([{ id: 'r1' }]);
    });
});
