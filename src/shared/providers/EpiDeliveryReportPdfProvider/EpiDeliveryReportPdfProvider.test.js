import epiDeliveryReportPdfProvider from './EpiDeliveryReportPdfProvider.js';

describe('EpiDeliveryReportPdfProvider', () => {
    it('gerarBufferPdf deve retornar PDF em buffer com conteudo minimo', async () => {
        const bufferPdf = await epiDeliveryReportPdfProvider.gerarBufferPdf({
            nomeFuncionario: 'Usuario Teste',
            cpfFuncionario: '12345678901',
            nomeCargo: 'Operador',
            nomeEmpresa: 'Empresa Teste',
            textoPeriodoReferencia: '01/02/2026 a 15/02/2026',
            entregasTabela: [
                { dataEntrega: '05/02/2026', nomeEquipamento: 'Capacete', numeroCa: '11070' }
            ]
        });
        expect(Buffer.isBuffer(bufferPdf)).toBe(true);
        expect(bufferPdf.length).toBeGreaterThan(400);
        expect(bufferPdf.subarray(0, 4).toString()).toBe('%PDF');
    });

    it('gerarBufferPdf deve aceitar lista de entregas vazia', async () => {
        const bufferPdf = await epiDeliveryReportPdfProvider.gerarBufferPdf({
            nomeFuncionario: 'Usuario Teste',
            cpfFuncionario: '12345678901',
            nomeCargo: 'Operador',
            nomeEmpresa: 'Empresa Teste',
            textoPeriodoReferencia: '01/02/2026 a 02/02/2026',
            entregasTabela: []
        });
        expect(Buffer.isBuffer(bufferPdf)).toBe(true);
        expect(bufferPdf.subarray(0, 4).toString()).toBe('%PDF');
    });
});
