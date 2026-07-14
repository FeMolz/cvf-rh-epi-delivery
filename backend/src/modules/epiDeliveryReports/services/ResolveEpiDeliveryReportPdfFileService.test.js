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

    it('deve rejeitar quando conteudo pdf for nulo', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPdfBinarioParaDownload.mockResolvedValue({
            pdfConteudo: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            employee: { name: 'Maria' }
        });

        await expect(resolveEpiDeliveryReportPdfFileService.execute('r8')).rejects.toThrow(
            'PDF do relatorio nao encontrado ou vazio na base de dados.'
        );
    });

    it('deve usar nome padrao quando employee.name nao for string', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPdfBinarioParaDownload.mockResolvedValue({
            pdfConteudo: Buffer.from('%PDF'),
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            employee: { name: null }
        });

        const resultado = await resolveEpiDeliveryReportPdfFileService.execute('r6');

        expect(resultado.nomeArquivoSugerido).toBe('funcionario_2026-01-01.pdf');
    });

    it('deve remover pontos finais e caracteres de controle do nome', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPdfBinarioParaDownload.mockResolvedValue({
            pdfConteudo: Buffer.from('%PDF'),
            createdAt: new Date('2026-01-02T00:00:00.000Z'),
            employee: { name: 'Ana\u0007Silva...' }
        });

        const resultado = await resolveEpiDeliveryReportPdfFileService.execute('r7');

        expect(resultado.nomeArquivoSugerido).toBe('AnaSilva_2026-01-02.pdf');
    });

    it('deve rejeitar identificador ausente', async () => {
        await expect(resolveEpiDeliveryReportPdfFileService.execute('')).rejects.toThrow(
            'identificadorRelatorio e obrigatorio.'
        );
    });

    it('deve rejeitar quando relatorio nao existir', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPdfBinarioParaDownload.mockResolvedValue(null);

        await expect(resolveEpiDeliveryReportPdfFileService.execute('r-inexistente')).rejects.toThrow(
            'Relatorio nao encontrado.'
        );
    });

    it('deve aceitar Uint8Array e usar updatedAt quando createdAt estiver ausente', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPdfBinarioParaDownload.mockResolvedValue({
            pdfConteudo: new Uint8Array([37, 80, 68, 70]),
            updatedAt: new Date('2026-03-10T00:00:00.000Z'),
            employee: { name: 'Pedro' }
        });

        const resultado = await resolveEpiDeliveryReportPdfFileService.execute('r3');

        expect(resultado.bufferPdf.subarray(0, 4).toString()).toBe('%PDF');
        expect(resultado.nomeArquivoSugerido).toBe('Pedro_2026-03-10.pdf');
    });

    it('deve usar funcionario como nome padrao apos sanitizacao vazia', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPdfBinarioParaDownload.mockResolvedValue({
            pdfConteudo: Buffer.from('%PDF'),
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            employee: { name: '<<<>>>' }
        });

        const resultado = await resolveEpiDeliveryReportPdfFileService.execute('r4');

        expect(resultado.nomeArquivoSugerido).toBe('funcionario_2026-01-01.pdf');
    });

    it('deve usar data-desconhecida para data invalida', async () => {
        epiDeliveryReportRepositoryMock.findByIdComPdfBinarioParaDownload.mockResolvedValue({
            pdfConteudo: Buffer.from('%PDF'),
            createdAt: 'data-invalida',
            employee: { name: 'Maria' }
        });

        const resultado = await resolveEpiDeliveryReportPdfFileService.execute('r5');

        expect(resultado.nomeArquivoSugerido).toBe('Maria_data-desconhecida.pdf');
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
