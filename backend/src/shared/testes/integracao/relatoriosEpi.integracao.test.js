import { jest } from '@jest/globals';

const bufferPdfIntegracao = Buffer.from('%PDF-integracao-test');
/** @type {Map<string, Buffer>} */
const arquivosStorageMock = new Map();

const pdfProviderMock = {
    gerarBufferPdf: jest.fn(() => Promise.resolve(bufferPdfIntegracao))
};

const supabaseStorageProviderMock = {
    obterBucketRelatoriosEpi: jest.fn(() => 'epi-reports-integracao'),
    montarPathRelatorioEpi: jest.fn(
        (identificadorFuncionario, identificadorRelatorio) =>
            `${identificadorFuncionario}/${identificadorRelatorio}.pdf`
    ),
    uploadArquivo: jest.fn(async ({ path, buffer }) => {
        arquivosStorageMock.set(path, buffer);
    }),
    downloadArquivo: jest.fn(async ({ path }) => arquivosStorageMock.get(path) || Buffer.alloc(0)),
    removerArquivo: jest.fn(async ({ path }) => {
        arquivosStorageMock.delete(path);
    })
};

jest.unstable_mockModule(
    '../../../shared/providers/EpiDeliveryReportPdfProvider/EpiDeliveryReportPdfProvider.js',
    () => ({
        default: pdfProviderMock
    })
);

jest.unstable_mockModule('../../../shared/providers/SupabaseStorageProvider/SupabaseStorageProvider.js', () => ({
    default: supabaseStorageProviderMock
}));

const prisma = (await import('../../../config/database.js')).default;
const generateEpiDeliveryReportPdfService = (
    await import('../../../modules/epiDeliveryReports/services/GenerateEpiDeliveryReportPdfService.js')
).default;
const listEpiDeliveryReportsService = (
    await import('../../../modules/epiDeliveryReports/services/ListEpiDeliveryReportsService.js')
).default;
const listPendingEpiDeliveryReportsService = (
    await import('../../../modules/epiDeliveryReports/services/ListPendingEpiDeliveryReportsService.js')
).default;
const resolveEpiDeliveryReportPdfFileService = (
    await import('../../../modules/epiDeliveryReports/services/ResolveEpiDeliveryReportPdfFileService.js')
).default;
const {
    criarDadosIntegracaoFuncionariosEpi,
    integracaoHabilitada,
    limparDadosIntegracaoFuncionariosEpi,
    verificarConexaoBancoIntegracao
} = await import('./utilitariosBancoIntegracao.js');
const { limparRelatoriosEpi } = await import('./utilitarios/limpeza.js');

const describeIntegracao = integracaoHabilitada() ? describe : describe.skip;

describeIntegracao('Integração — relatórios de entrega de EPI', () => {
    const sufixo = `${Date.now()}`;
    /** @type {Awaited<ReturnType<typeof criarDadosIntegracaoFuncionariosEpi>>} */
    let dadosTeste;
    /** @type {string | null} */
    let relatorioId = null;

    beforeAll(async () => {
        await verificarConexaoBancoIntegracao();
        dadosTeste = await criarDadosIntegracaoFuncionariosEpi(sufixo);
    });

    afterAll(async () => {
        if (relatorioId) {
            await limparRelatoriosEpi([relatorioId]);
        }
        if (dadosTeste) {
            await limparDadosIntegracaoFuncionariosEpi(dadosTeste);
        }
        await prisma.$disconnect();
    });

    it('deve gerar relatório com PDF mockado e persistir metadados', async () => {
        const relatorio = await generateEpiDeliveryReportPdfService.execute({
            employeeId: dadosTeste.funcionarioAtivo.id,
            periodoInicio: '2025-12-01',
            periodoFim: '2025-12-31',
            generatedByUserId: dadosTeste.usuarioEntregador.id
        });

        relatorioId = relatorio.id;

        const persistido = await prisma.epiDeliveryReport.findUnique({
            where: { id: relatorio.id }
        });

        expect(persistido.pdfStoragePath).toContain(dadosTeste.funcionarioAtivo.id);
        expect(persistido.pdfTamanhoBytes).toBeGreaterThan(0);
        expect(supabaseStorageProviderMock.uploadArquivo).toHaveBeenCalled();
        expect(pdfProviderMock.gerarBufferPdf).toHaveBeenCalled();
    });

    it('deve listar relatórios emitidos e pendências de assinatura', async () => {
        const listagem = await listEpiDeliveryReportsService.execute({
            employeeId: dadosTeste.funcionarioAtivo.id
        });

        expect(listagem.itens.some((item) => item.id === relatorioId)).toBe(true);

        const pendentes = await listPendingEpiDeliveryReportsService.execute();
        expect(pendentes.some((item) => item.id === relatorioId)).toBe(true);
    });

    it('deve baixar buffer PDF do storage mockado', async () => {
        const arquivo = await resolveEpiDeliveryReportPdfFileService.execute(relatorioId);

        expect(arquivo.bufferPdf.slice(0, 4).toString()).toBe('%PDF');
        expect(arquivo.bufferPdf.length).toBeGreaterThan(0);
        expect(arquivo.nomeArquivoSugerido.endsWith('.pdf')).toBe(true);
        expect(supabaseStorageProviderMock.downloadArquivo).toHaveBeenCalled();
    });
});
