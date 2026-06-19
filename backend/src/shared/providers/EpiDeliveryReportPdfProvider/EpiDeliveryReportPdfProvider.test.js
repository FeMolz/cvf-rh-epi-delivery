import { jest } from '@jest/globals';

const montarHtmlMock = jest.fn(() => '<html>relatorio</html>');
const renderizarPdfMock = jest.fn(() => Promise.resolve(Buffer.from('%PDF-test')));

jest.unstable_mockModule('./montarHtmlRelatorioEntregaEpi.js', () => ({
    montarHtmlRelatorioEntregaEpi: montarHtmlMock
}));

jest.unstable_mockModule('./renderizarHtmlParaPdf.js', () => ({
    renderizarHtmlParaPdf: renderizarPdfMock
}));

const epiDeliveryReportPdfProvider = (await import('./EpiDeliveryReportPdfProvider.js')).default;

describe('EpiDeliveryReportPdfProvider', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const payloadExemplo = {
        nomeFuncionario: 'Usuario Teste',
        nomeCargo: 'Operador',
        nomeEmpresa: 'Empresa Teste',
        nomeSetor: 'Almoxarifado',
        textoPeriodoReferencia: '01/02/2026 a 15/02/2026',
        entregasTabela: [
            { dataEntrega: '05/02/2026', nomeEquipamento: 'Capacete', numeroCa: '11070' }
        ]
    };

    it('gerarBufferPdf deve montar HTML e renderizar PDF', async () => {
        const bufferPdf = await epiDeliveryReportPdfProvider.gerarBufferPdf(payloadExemplo);

        expect(montarHtmlMock).toHaveBeenCalledWith(payloadExemplo);
        expect(renderizarPdfMock).toHaveBeenCalledWith('<html>relatorio</html>');
        expect(Buffer.isBuffer(bufferPdf)).toBe(true);
        expect(bufferPdf.toString()).toBe('%PDF-test');
    });
});
