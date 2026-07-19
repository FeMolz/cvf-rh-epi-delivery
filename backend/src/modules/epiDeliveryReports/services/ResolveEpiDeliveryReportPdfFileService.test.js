import { jest } from '@jest/globals';

const epiDeliveryReportRepositoryMock = {
    findByIdComPathPdfParaDownload: jest.fn()
};

const supabaseStorageProviderMock = {
    obterBucketRelatoriosEpi: jest.fn(() => 'epi-reports'),
    downloadArquivo: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiDeliveryReportRepository.js', () => ({
    default: epiDeliveryReportRepositoryMock
}));

jest.unstable_mockModule('../../../shared/providers/SupabaseStorageProvider/SupabaseStorageProvider.js', () => ({
    default: supabaseStorageProviderMock
}));

const resolveEpiDeliveryReportPdfFileService = (await import('./ResolveEpiDeliveryReportPdfFileService.js')).default;

describe('ResolveEpiDeliveryReportPdfFileService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve rejeitar quando path do pdf for nulo', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPathPdfParaDownload.mockResolvedValue({
            pdfStoragePath: null,
            pdfTamanhoBytes: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            employee: { name: 'Maria' }
        });

        await expect(resolveEpiDeliveryReportPdfFileService.execute('r8')).rejects.toThrow(
            'PDF do relatorio nao encontrado ou vazio na base de dados.'
        );
    });

    it('deve usar nome padrao quando employee.name nao for string', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPathPdfParaDownload.mockResolvedValue({
            pdfStoragePath: 'e1/r6.pdf',
            pdfTamanhoBytes: 4,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            employee: { name: null }
        });
        supabaseStorageProviderMock.downloadArquivo.mockResolvedValue(Buffer.from('%PDF'));

        const resultado = await resolveEpiDeliveryReportPdfFileService.execute('r6');

        expect(resultado.nomeArquivoSugerido).toBe('funcionario_2026-01-01.pdf');
    });

    it('deve remover pontos finais e caracteres de controle do nome', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPathPdfParaDownload.mockResolvedValue({
            pdfStoragePath: 'e1/r7.pdf',
            pdfTamanhoBytes: 4,
            createdAt: new Date('2026-01-02T00:00:00.000Z'),
            employee: { name: 'Ana\u0007Silva...' }
        });
        supabaseStorageProviderMock.downloadArquivo.mockResolvedValue(Buffer.from('%PDF'));

        const resultado = await resolveEpiDeliveryReportPdfFileService.execute('r7');

        expect(resultado.nomeArquivoSugerido).toBe('AnaSilva_2026-01-02.pdf');
    });

    it('deve rejeitar identificador ausente', async () => {
        await expect(resolveEpiDeliveryReportPdfFileService.execute('')).rejects.toThrow(
            'identificadorRelatorio e obrigatorio.'
        );
    });

    it('deve rejeitar quando relatorio nao existir', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPathPdfParaDownload.mockResolvedValue(null);

        await expect(resolveEpiDeliveryReportPdfFileService.execute('r-inexistente')).rejects.toThrow(
            'Relatorio nao encontrado.'
        );
    });

    it('deve baixar do storage e usar updatedAt quando createdAt estiver ausente', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPathPdfParaDownload.mockResolvedValue({
            pdfStoragePath: 'e1/r3.pdf',
            pdfTamanhoBytes: 4,
            updatedAt: new Date('2026-03-10T00:00:00.000Z'),
            employee: { name: 'Pedro' }
        });
        supabaseStorageProviderMock.downloadArquivo.mockResolvedValue(Buffer.from('%PDF'));

        const resultado = await resolveEpiDeliveryReportPdfFileService.execute('r3');

        expect(supabaseStorageProviderMock.downloadArquivo).toHaveBeenCalledWith({
            bucket: 'epi-reports',
            path: 'e1/r3.pdf'
        });
        expect(resultado.bufferPdf.subarray(0, 4).toString()).toBe('%PDF');
        expect(resultado.nomeArquivoSugerido).toBe('Pedro_2026-03-10.pdf');
    });

    it('deve usar funcionario como nome padrao apos sanitizacao vazia', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPathPdfParaDownload.mockResolvedValue({
            pdfStoragePath: 'e1/r4.pdf',
            pdfTamanhoBytes: 4,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            employee: { name: '<<<>>>' }
        });
        supabaseStorageProviderMock.downloadArquivo.mockResolvedValue(Buffer.from('%PDF'));

        const resultado = await resolveEpiDeliveryReportPdfFileService.execute('r4');

        expect(resultado.nomeArquivoSugerido).toBe('funcionario_2026-01-01.pdf');
    });

    it('deve usar data-desconhecida para data invalida', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPathPdfParaDownload.mockResolvedValue({
            pdfStoragePath: 'e1/r5.pdf',
            pdfTamanhoBytes: 4,
            createdAt: 'data-invalida',
            employee: { name: 'Maria' }
        });
        supabaseStorageProviderMock.downloadArquivo.mockResolvedValue(Buffer.from('%PDF'));

        const resultado = await resolveEpiDeliveryReportPdfFileService.execute('r5');

        expect(resultado.nomeArquivoSugerido).toBe('Maria_data-desconhecida.pdf');
    });

    it('deve retornar buffer PDF e nome sugerido quando arquivo existe no storage', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPathPdfParaDownload.mockResolvedValue({
            pdfStoragePath: 'e1/rid-uuid-here.pdf',
            pdfTamanhoBytes: 14,
            createdAt: new Date('2026-05-15T14:30:00.000Z'),
            employee: { name: 'Maria Silva' }
        });
        supabaseStorageProviderMock.downloadArquivo.mockResolvedValue(Buffer.from('%PDF-1.4 teste'));

        const resultado = await resolveEpiDeliveryReportPdfFileService.execute('rid-uuid-here');

        expect(resultado.bufferPdf.length).toBeGreaterThan(0);
        expect(resultado.bufferPdf.subarray(0, 4).toString()).toBe('%PDF');
        expect(resultado.nomeArquivoSugerido).toBe('Maria_Silva_2026-05-15.pdf');
    });

    it('deve sanitizar nome e usar data-desconhecida sem createdAt', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPathPdfParaDownload.mockResolvedValue({
            pdfStoragePath: 'e1/r2.pdf',
            pdfTamanhoBytes: 4,
            employee: { name: '  João / Teste  ' }
        });
        supabaseStorageProviderMock.downloadArquivo.mockResolvedValue(Buffer.from('%PDF'));

        const resultado = await resolveEpiDeliveryReportPdfFileService.execute('r2');

        expect(resultado.nomeArquivoSugerido).toBe('João_Teste_data-desconhecida.pdf');
    });

    it('deve falhar quando PDF baixado estiver vazio', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPathPdfParaDownload.mockResolvedValue({
            pdfStoragePath: 'e1/r1.pdf',
            pdfTamanhoBytes: 0,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            employee: { name: 'X' }
        });
        supabaseStorageProviderMock.downloadArquivo.mockResolvedValue(Buffer.alloc(0));

        await expect(resolveEpiDeliveryReportPdfFileService.execute('r1')).rejects.toThrow(
            'PDF do relatorio nao encontrado ou vazio na base de dados.'
        );
    });
});
