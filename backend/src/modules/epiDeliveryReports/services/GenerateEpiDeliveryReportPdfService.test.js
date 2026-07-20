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

const supabaseStorageProviderMock = {
    obterBucketRelatoriosEpi: jest.fn(() => 'epi-reports'),
    montarPathRelatorioEpi: jest.fn(() => 'e1/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.pdf'),
    uploadArquivo: jest.fn(() => Promise.resolve()),
    removerArquivo: jest.fn(() => Promise.resolve())
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

jest.unstable_mockModule('../../../shared/providers/SupabaseStorageProvider/SupabaseStorageProvider.js', () => ({
    default: supabaseStorageProviderMock
}));

const generateEpiDeliveryReportPdfService = (await import('./GenerateEpiDeliveryReportPdfService.js')).default;

describe('GenerateEpiDeliveryReportPdfService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve enviar PDF ao storage e persistir metadados no banco', async () => {
        epiDeliveryReportRepositoryMock.findEmployeeContextForReport.mockResolvedValue({
            id: 'e1',
            name: 'Joao',
            cpf: '123',
            role: { name: 'Cargo X' },
            company: { name: 'Empresa Y' },
            setor: { nome: 'Setor Z' }
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
        expect(supabaseStorageProviderMock.uploadArquivo).toHaveBeenCalledWith(
            expect.objectContaining({
                bucket: 'epi-reports',
                path: 'e1/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.pdf',
                buffer: expect.any(Buffer)
            })
        );
        expect(epiDeliveryReportRepositoryMock.createReport).toHaveBeenCalledWith(
            expect.objectContaining({
                employeeId: 'e1',
                pdfStoragePath: 'e1/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.pdf',
                pdfTamanhoBytes: expect.any(Number),
                foiAssinado: false,
                foiImpresso: false,
                foiEncaminhado: false
            })
        );
    });

    it('deve rejeitar quando funcionario nao for encontrado', async () => {
        epiDeliveryReportRepositoryMock.findEmployeeContextForReport.mockResolvedValue(null);

        await expect(
            generateEpiDeliveryReportPdfService.execute({
                employeeId: 'inexistente',
                periodoInicio: '2026-02-01',
                periodoFim: '2026-02-15',
                generatedByUserId: 'u1'
            })
        ).rejects.toThrow('Funcionario nao encontrado ou indisponivel para emissao.');
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

    it('deve rejeitar quando nao houver entregas no periodo', async () => {
        epiDeliveryReportRepositoryMock.findEmployeeContextForReport.mockResolvedValue({
            id: 'e1',
            name: 'Joao',
            cpf: '123',
            role: { name: 'Cargo X' },
            company: { name: 'Empresa Y' },
            setor: { nome: 'Setor Z' }
        });
        epiDeliveryRepositoryMock.findDeliveriesByEmployeeIdAndDeliveryDateRange.mockResolvedValue([]);

        await expect(
            generateEpiDeliveryReportPdfService.execute({
                employeeId: 'e1',
                periodoInicio: '2026-02-01',
                periodoFim: '2026-02-02',
                generatedByUserId: 'u1'
            })
        ).rejects.toThrow('Nao ha entregas de EPI no periodo informado para emitir o relatorio.');

        expect(pdfProviderMock.gerarBufferPdf).not.toHaveBeenCalled();
        expect(supabaseStorageProviderMock.uploadArquivo).not.toHaveBeenCalled();
        expect(epiDeliveryReportRepositoryMock.createReport).not.toHaveBeenCalled();
    });

    it('deve remover arquivo do storage quando persistencia falhar', async () => {
        epiDeliveryReportRepositoryMock.findEmployeeContextForReport.mockResolvedValue({
            id: 'e1',
            name: 'Joao',
            cpf: '123',
            role: { name: 'Cargo X' },
            company: { name: 'Empresa Y' },
            setor: { nome: 'Setor Z' }
        });
        epiDeliveryRepositoryMock.findDeliveriesByEmployeeIdAndDeliveryDateRange.mockResolvedValue([
            {
                deliveryDate: new Date('2026-02-05T12:00:00.000Z'),
                epi: { name: 'Capacete', caNumber: '1' }
            }
        ]);
        epiDeliveryReportRepositoryMock.createReport.mockRejectedValue(new Error('falha banco'));

        await expect(
            generateEpiDeliveryReportPdfService.execute({
                employeeId: 'e1',
                periodoInicio: '2026-02-01',
                periodoFim: '2026-02-02',
                generatedByUserId: 'u1'
            })
        ).rejects.toThrow('falha banco');

        expect(supabaseStorageProviderMock.removerArquivo).toHaveBeenCalledWith({
            bucket: 'epi-reports',
            path: 'e1/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.pdf'
        });
    });
});
