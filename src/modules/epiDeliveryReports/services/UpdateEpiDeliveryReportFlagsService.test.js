import { jest } from '@jest/globals';

const epiDeliveryReportRepositoryMock = {
    findById: jest.fn(),
    updateFlagsById: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiDeliveryReportRepository.js', () => ({
    default: epiDeliveryReportRepositoryMock
}));

const updateEpiDeliveryReportFlagsService = (await import('./UpdateEpiDeliveryReportFlagsService.js')).default;

describe('UpdateEpiDeliveryReportFlagsService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve rejeitar quando relatorio nao existe', async () => {
        epiDeliveryReportRepositoryMock.findById.mockResolvedValue(null);
        await expect(updateEpiDeliveryReportFlagsService.execute('r1', { foiImpresso: true })).rejects.toThrow(
            'Relatorio nao encontrado.'
        );
    });

    it('deve rejeitar quando nenhum flag booleano e enviado', async () => {
        epiDeliveryReportRepositoryMock.findById.mockResolvedValue({ id: 'r1' });
        await expect(updateEpiDeliveryReportFlagsService.execute('r1', {})).rejects.toThrow(
            'Informe ao menos um dos campos: foiImpresso, foiEncaminhado ou foiAssinado.'
        );
    });

    it('deve ignorar valores nao booleanos e ainda assim atualizar campos validos', async () => {
        epiDeliveryReportRepositoryMock.findById.mockResolvedValue({ id: 'r1' });
        epiDeliveryReportRepositoryMock.updateFlagsById.mockResolvedValue({ id: 'r1', foiAssinado: true });
        const resultado = await updateEpiDeliveryReportFlagsService.execute('r1', {
            foiAssinado: true,
            foiImpresso: 'sim'
        });
        expect(resultado.foiAssinado).toBe(true);
        expect(epiDeliveryReportRepositoryMock.updateFlagsById).toHaveBeenCalledWith('r1', { foiAssinado: true });
    });
});
