import { jest } from '@jest/globals';

const epiDeliveryReportRepositoryMock = {
    findByIdComPdfBinarioParaDownload: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiDeliveryReportRepository.js', () => ({
    default: epiDeliveryReportRepositoryMock
}));

const resolveEpiDeliveryReportPdfFileService = (await import('./ResolveEpiDeliveryReportPdfFileService.js')).default;

describe('ResolveEpiDeliveryReportPdfFileService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar buffer PDF e nome sugerido quando binario existe', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPdfBinarioParaDownload.mockResolvedValue({
            pdfConteudo: Buffer.from('%PDF-1.4 teste'),
            createdAt: new Date('2026-05-15T14:30:00.000Z'),
            employee: { name: 'Maria Silva' }
        });
        const resultado = await resolveEpiDeliveryReportPdfFileService.execute('rid-uuid-here');
        expect(resultado.bufferPdf.length).toBeGreaterThan(0);
        expect(resultado.bufferPdf.subarray(0, 4).toString()).toBe('%PDF');
        expect(resultado.nomeArquivoSugerido).toBe('Maria_Silva_2026-05-15.pdf');
    });

    it('deve sanitizar nome e usar data-desconhecida sem createdAt', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPdfBinarioParaDownload.mockResolvedValue({
            pdfConteudo: Buffer.from('%PDF'),
            employee: { name: '  João / Teste  ' }
        });
        const resultado = await resolveEpiDeliveryReportPdfFileService.execute('r2');
        expect(resultado.nomeArquivoSugerido).toBe('João_Teste_data-desconhecida.pdf');
    });

    it('deve falhar quando PDF binario vazio', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPdfBinarioParaDownload.mockResolvedValue({
            pdfConteudo: Buffer.alloc(0),
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            employee: { name: 'X' }
        });
        await expect(resolveEpiDeliveryReportPdfFileService.execute('r1')).rejects.toThrow(
            'PDF do relatorio nao encontrado ou vazio na base de dados.'
        );
    });
});
