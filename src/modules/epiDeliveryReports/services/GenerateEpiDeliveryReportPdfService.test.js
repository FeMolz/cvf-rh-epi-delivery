import { jest } from '@jest/globals';

jest.unstable_mockModule('node:crypto', () => ({
    randomUUID: jest.fn(() => 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
}));

const epiDeliveryReportRepositoryMock = {
    findEmployeeContextForReport: jest.fn(),
    createReport: jest.fn()
};

const epiDeliveryRepositoryMock = {
    findDeliveriesByEmployeeIdAndDeliveryDateRange: jest.fn()
};

const pdfProviderMock = {
    gerarBufferPdf: jest.fn(() => Promise.resolve(Buffer.from('%PDF-test')))
};

jest.unstable_mockModule('../repositories/EpiDeliveryReportRepository.js', () => ({
    default: epiDeliveryReportRepositoryMock
}));

jest.unstable_mockModule('../../epiDeliveries/repositories/EpiDeliveryRepository.js', () => ({
    default: epiDeliveryRepositoryMock
}));

jest.unstable_mockModule('../../../shared/providers/EpiDeliveryReportPdfProvider/EpiDeliveryReportPdfProvider.js', () => ({
    default: pdfProviderMock
}));

const generateEpiDeliveryReportPdfService = (await import('./GenerateEpiDeliveryReportPdfService.js')).default;

describe('GenerateEpiDeliveryReportPdfService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve persistir PDF binario no banco com o relatorio', async () => {
        epiDeliveryReportRepositoryMock.findEmployeeContextForReport.mockResolvedValue({
            id: 'e1',
            name: 'Joao',
            cpf: '123',
            role: { name: 'Cargo X' },
            company: { name: 'Empresa Y' }
        });
        epiDeliveryRepositoryMock.findDeliveriesByEmployeeIdAndDeliveryDateRange.mockResolvedValue([
            {
                deliveryDate: new Date('2026-02-05T12:00:00.000Z'),
                epi: { name: 'Capacete', caNumber: '1' }
            }
        ]);
        epiDeliveryReportRepositoryMock.createReport.mockResolvedValue({ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' });

        const resultado = await generateEpiDeliveryReportPdfService.execute({
            employeeId: 'e1',
            periodoInicio: '2026-02-01',
            periodoFim: '2026-02-15',
            generatedByUserId: 'u1'
        });

        expect(resultado.id).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
        expect(pdfProviderMock.gerarBufferPdf).toHaveBeenCalledWith(
            expect.objectContaining({
                nomeFuncionario: 'Joao',
                entregasTabela: [
                    expect.objectContaining({
                        nomeEquipamento: 'Capacete',
                        numeroCa: '1'
                    })
                ]
            })
        );
        expect(epiDeliveryReportRepositoryMock.createReport).toHaveBeenCalledWith(
            expect.objectContaining({
                employeeId: 'e1',
                pdfConteudo: expect.any(Buffer),
                foiAssinado: false,
                foiImpresso: false,
                foiEncaminhado: false
            })
        );
    });

    it('deve rejeitar campos obrigatorios ausentes', async () => {
        await expect(
            generateEpiDeliveryReportPdfService.execute({
                employeeId: '',
                periodoInicio: '2026-02-01',
                periodoFim: '2026-02-15',
                generatedByUserId: 'u1'
            })
        ).rejects.toThrow('employeeId, periodoInicio e periodoFim sao obrigatorios.');
    });

    it('deve propagar erro quando persistencia falhar', async () => {
        epiDeliveryReportRepositoryMock.findEmployeeContextForReport.mockResolvedValue({
            id: 'e1',
            name: 'Joao',
            cpf: '123',
            role: { name: 'Cargo X' },
            company: { name: 'Empresa Y' }
        });
        epiDeliveryRepositoryMock.findDeliveriesByEmployeeIdAndDeliveryDateRange.mockResolvedValue([]);
        epiDeliveryReportRepositoryMock.createReport.mockRejectedValue(new Error('falha banco'));

        await expect(
            generateEpiDeliveryReportPdfService.execute({
                employeeId: 'e1',
                periodoInicio: '2026-02-01',
                periodoFim: '2026-02-02',
                generatedByUserId: 'u1'
            })
        ).rejects.toThrow('falha banco');
    });
});
