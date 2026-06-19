import { jest } from '@jest/globals';
import {
    MENSAGEM_CAMPOS_OBRIGATORIOS_EMISSAO,
    MENSAGEM_RELATORIO_NAO_ENCONTRADO
} from '../constants/relatorioEntregaEpiConstantes.js';

const generateMock = { execute: jest.fn() };
const listPendingMock = { execute: jest.fn() };
const listArchiveMock = { execute: jest.fn() };
const updateFlagsMock = { execute: jest.fn() };
const resolvePdfMock = { execute: jest.fn() };

jest.unstable_mockModule('../services/GenerateEpiDeliveryReportPdfService.js', () => ({
    default: generateMock
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

    it('downloadPdf deve retornar 404 quando relatorio nao existe', async () => {
        resolvePdfMock.execute.mockRejectedValue(new Error(MENSAGEM_RELATORIO_NAO_ENCONTRADO));
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.downloadPdf({ params: { id: 'x' } }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(404);
    });

    it('listPending deve retornar 200', async () => {
        listPendingMock.execute.mockResolvedValue([]);
        const resposta = criarMocksResposta();

        await epiDeliveryReportController.listPending({}, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(200);
    });
});
