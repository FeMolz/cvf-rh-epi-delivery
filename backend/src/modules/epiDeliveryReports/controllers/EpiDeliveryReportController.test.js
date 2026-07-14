import { jest } from '@jest/globals';
import {
    MENSAGEM_ARQUIVO_PDF_AUSENTE,
    MENSAGEM_CAMPOS_OBRIGATORIOS_EMISSAO,
    MENSAGEM_FLAGS_OBRIGATORIAS,
    MENSAGEM_IDENTIFICADOR_FUNCIONARIO_OBRIGATORIO,
    MENSAGEM_RELATORIO_NAO_ENCONTRADO
} from '../constants/relatorioEntregaEpiConstantes.js';

const generateMock = { execute: jest.fn() };
const listMock = { execute: jest.fn() };
const previewMock = { execute: jest.fn() };
const listEligibleMock = { execute: jest.fn() };
const listHistoryMock = { execute: jest.fn() };
const listPendingMock = { execute: jest.fn() };
const listArchiveMock = { execute: jest.fn() };
const updateFlagsMock = { execute: jest.fn() };
const resolvePdfMock = { execute: jest.fn() };

jest.unstable_mockModule('../services/GenerateEpiDeliveryReportPdfService.js', () => ({
    default: generateMock
}));
jest.unstable_mockModule('../services/ListEpiDeliveryReportsService.js', () => ({
    default: listMock
}));
jest.unstable_mockModule('../services/PreviewEpiDeliveryReportService.js', () => ({
    default: previewMock
}));
jest.unstable_mockModule('../services/ListEmployeesEligibleForReportEmissionService.js', () => ({
    default: listEligibleMock
}));
jest.unstable_mockModule('../services/ListEmployeesWithReportHistoryService.js', () => ({
    default: listHistoryMock
}));
jest.unstable_mockModule('../services/ListPendingEpiDeliveryReportsService.js', () => ({
    default: listPendingMock
}));
jest.unstable_mockModule('../services/ListEmployeeEpiDeliveryReportArchiveService.js', () => ({
    default: listArchiveMock
}));
jest.unstable_mockModule('../services/UpdateEpiDeliveryReportFlagsService.js', () => ({
    default: updateFlagsMock
}));
jest.unstable_mockModule('../services/ResolveEpiDeliveryReportPdfFileService.js', () => ({
    default: resolvePdfMock
}));

const epiDeliveryReportController = (await import('./EpiDeliveryReportController.js')).default;

function criarMocksResposta() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
        attachment: jest.fn(),
        send: jest.fn()
    };
}

describe('EpiDeliveryReportController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('create deve retornar 201', async () => {
        generateMock.execute.mockResolvedValue({ id: 'rel1' });
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.create(
            {
                body: { employeeId: 'e1', periodoInicio: '2026-01-01', periodoFim: '2026-01-31' },
                user: { id: 'u1' }
            },
            resposta,
            jest.fn()
        );

        expect(resposta.status).toHaveBeenCalledWith(201);
    });

    it('create deve retornar 400 para validacao', async () => {
        generateMock.execute.mockRejectedValue(new Error(MENSAGEM_CAMPOS_OBRIGATORIOS_EMISSAO));
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.create({ body: {}, user: { id: 'u1' } }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(400);
    });

    it('create deve encaminhar erro inesperado ao next', async () => {
        const erro = new Error('falha interna');
        generateMock.execute.mockRejectedValue(erro);
        const proximo = jest.fn();

        await epiDeliveryReportController.create(
            { body: { employeeId: 'e1' }, user: { id: 'u1' } },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('list deve retornar 200', async () => {
        listMock.execute.mockResolvedValue({ itens: [] });
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.list({ query: {} }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(200);
    });

    it('list deve retornar 400 para validacao', async () => {
        listMock.execute.mockRejectedValue(new Error(MENSAGEM_IDENTIFICADOR_FUNCIONARIO_OBRIGATORIO));
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.list({ query: {} }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(400);
    });

    it('preview deve retornar 200', async () => {
        previewMock.execute.mockResolvedValue({ preview: true });
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.preview(
            { query: { employeeId: 'e1', periodoInicio: '2026-01-01', periodoFim: '2026-01-31' } },
            resposta,
            jest.fn()
        );

        expect(resposta.status).toHaveBeenCalledWith(200);
    });

    it('preview deve retornar 400 para validacao', async () => {
        previewMock.execute.mockRejectedValue(new Error(MENSAGEM_CAMPOS_OBRIGATORIOS_EMISSAO));
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.preview({ query: {} }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(400);
    });

    it('listEmployeesEligibleForEmission deve retornar 200', async () => {
        listEligibleMock.execute.mockResolvedValue([]);
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.listEmployeesEligibleForEmission({}, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(200);
    });

    it('listEmployeesWithReports deve retornar 200', async () => {
        listHistoryMock.execute.mockResolvedValue([]);
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.listEmployeesWithReports({}, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(200);
    });

    it('listPending deve retornar 200', async () => {
        listPendingMock.execute.mockResolvedValue([]);
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.listPending({}, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(200);
    });

    it('listArchiveByEmployee deve retornar 200', async () => {
        listArchiveMock.execute.mockResolvedValue([]);
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.listArchiveByEmployee(
            { params: { employeeId: 'e1' } },
            resposta,
            jest.fn()
        );

        expect(resposta.status).toHaveBeenCalledWith(200);
    });

    it('listArchiveByEmployee deve retornar 400 para validacao', async () => {
        listArchiveMock.execute.mockRejectedValue(new Error(MENSAGEM_IDENTIFICADOR_FUNCIONARIO_OBRIGATORIO));
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.listArchiveByEmployee({ params: {} }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(400);
    });

    it('updateFlags deve retornar 200', async () => {
        updateFlagsMock.execute.mockResolvedValue({ id: 'r1', foiImpresso: true });
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.updateFlags(
            { params: { id: 'r1' }, body: { foiImpresso: true } },
            resposta,
            jest.fn()
        );

        expect(resposta.status).toHaveBeenCalledWith(200);
    });

    it('updateFlags deve retornar 404 quando relatorio nao existe', async () => {
        updateFlagsMock.execute.mockRejectedValue(new Error(MENSAGEM_RELATORIO_NAO_ENCONTRADO));
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.updateFlags({ params: { id: 'x' }, body: {} }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(404);
    });

    it('updateFlags deve retornar 400 para validacao', async () => {
        updateFlagsMock.execute.mockRejectedValue(new Error(MENSAGEM_FLAGS_OBRIGATORIAS));
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.updateFlags({ params: { id: 'r1' }, body: {} }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(400);
    });

    it('downloadPdf deve enviar arquivo pdf', async () => {
        const buffer = Buffer.from('pdf');
        resolvePdfMock.execute.mockResolvedValue({ bufferPdf: buffer, nomeArquivoSugerido: 'relatorio.pdf' });
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.downloadPdf({ params: { id: 'r1' } }, resposta, jest.fn());

        expect(resposta.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(resposta.attachment).toHaveBeenCalledWith('relatorio.pdf');
        expect(resposta.send).toHaveBeenCalledWith(buffer);
    });

    it('downloadPdf deve retornar 404 quando relatorio nao existe', async () => {
        resolvePdfMock.execute.mockRejectedValue(new Error(MENSAGEM_RELATORIO_NAO_ENCONTRADO));
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.downloadPdf({ params: { id: 'x' } }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(404);
    });

    it('downloadPdf deve retornar 404 quando pdf ausente', async () => {
        resolvePdfMock.execute.mockRejectedValue(new Error(MENSAGEM_ARQUIVO_PDF_AUSENTE));
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.downloadPdf({ params: { id: 'x' } }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(404);
    });

    it('list deve encaminhar erro inesperado ao next', async () => {
        const erro = new Error('falha interna');
        listMock.execute.mockRejectedValue(erro);
        const proximo = jest.fn();

        await epiDeliveryReportController.list({ query: {} }, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('preview deve encaminhar erro inesperado ao next', async () => {
        const erro = new Error('falha interna');
        previewMock.execute.mockRejectedValue(erro);
        const proximo = jest.fn();

        await epiDeliveryReportController.preview({ query: {} }, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('listEmployeesEligibleForEmission deve encaminhar erro ao next', async () => {
        const erro = new Error('falha listagem');
        listEligibleMock.execute.mockRejectedValue(erro);
        const proximo = jest.fn();

        await epiDeliveryReportController.listEmployeesEligibleForEmission({}, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('listEmployeesWithReports deve encaminhar erro ao next', async () => {
        const erro = new Error('falha listagem');
        listHistoryMock.execute.mockRejectedValue(erro);
        const proximo = jest.fn();

        await epiDeliveryReportController.listEmployeesWithReports({}, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('listPending deve encaminhar erro ao next', async () => {
        const erro = new Error('falha listagem');
        listPendingMock.execute.mockRejectedValue(erro);
        const proximo = jest.fn();

        await epiDeliveryReportController.listPending({}, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('listArchiveByEmployee deve encaminhar erro inesperado ao next', async () => {
        const erro = new Error('falha interna');
        listArchiveMock.execute.mockRejectedValue(erro);
        const proximo = jest.fn();

        await epiDeliveryReportController.listArchiveByEmployee(
            { params: { employeeId: 'e1' } },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('updateFlags deve encaminhar erro inesperado ao next', async () => {
        const erro = new Error('falha interna');
        updateFlagsMock.execute.mockRejectedValue(erro);
        const proximo = jest.fn();

        await epiDeliveryReportController.updateFlags(
            { params: { id: 'r1' }, body: { foiImpresso: true } },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('downloadPdf deve encaminhar erro inesperado ao next', async () => {
        const erro = new Error('falha interna');
        resolvePdfMock.execute.mockRejectedValue(erro);
        const proximo = jest.fn();

        await epiDeliveryReportController.downloadPdf({ params: { id: 'r1' } }, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });
});
