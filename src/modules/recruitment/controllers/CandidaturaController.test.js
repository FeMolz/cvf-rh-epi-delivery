import { jest } from '@jest/globals';
import {
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_CURRICULO_AUSENTE,
    MENSAGEM_EMAIL_OBRIGATORIO,
    MENSAGEM_PERIODO_FILTRO_INVALIDO
} from '../constants/recrutamentoConstantes.js';

const createCandidaturaServiceMock = { execute: jest.fn() };
const listCandidaturasServiceMock = { execute: jest.fn() };
const getCandidaturaServiceMock = { execute: jest.fn() };
const downloadCurriculoCandidaturaServiceMock = { execute: jest.fn() };

jest.unstable_mockModule('../services/CreateCandidaturaService.js', () => ({
    default: createCandidaturaServiceMock
}));
jest.unstable_mockModule('../services/ListCandidaturasService.js', () => ({
    default: listCandidaturasServiceMock
}));
jest.unstable_mockModule('../services/GetCandidaturaService.js', () => ({
    default: getCandidaturaServiceMock
}));
jest.unstable_mockModule('../services/DownloadCurriculoCandidaturaService.js', () => ({
    default: downloadCurriculoCandidaturaServiceMock
}));

jest.unstable_mockModule('../../../shared/utils/registrarEventoAuditoria.js', () => ({
    registrarEventoAuditoria: jest.fn(),
    TIPOS_EVENTO_AUDITORIA: { DOWNLOAD_CURRICULO: 'DOWNLOAD_CURRICULO' }
}));

const candidaturaController = (await import('./CandidaturaController.js')).default;

function criarMocksResposta() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
        attachment: jest.fn(),
        send: jest.fn()
    };
}

describe('CandidaturaController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('createPublica deve retornar 201 quando candidatura e criada', async () => {
        const candidatura = { id: 'c1' };
        createCandidaturaServiceMock.execute.mockResolvedValue(candidatura);
        const requisicao = {
            params: { id: 'v1' },
            body: { nomeCompleto: 'Maria', email: 'm@e.com' },
            file: { buffer: Buffer.from('pdf') }
        };
        const resposta = criarMocksResposta();

        await candidaturaController.createPublica(requisicao, resposta, jest.fn());

        expect(createCandidaturaServiceMock.execute).toHaveBeenCalledWith(
            'v1',
            requisicao.body,
            requisicao.file
        );
        expect(resposta.status).toHaveBeenCalledWith(201);
        expect(resposta.json).toHaveBeenCalledWith(candidatura);
    });

    it('createPublica deve retornar 400 para email obrigatorio', async () => {
        createCandidaturaServiceMock.execute.mockRejectedValue(new Error(MENSAGEM_EMAIL_OBRIGATORIO));
        const resposta = criarMocksResposta();

        await candidaturaController.createPublica(
            { params: { id: 'v1' }, body: {}, file: null },
            resposta,
            jest.fn()
        );

        expect(resposta.status).toHaveBeenCalledWith(400);
    });

    it('createPublica deve retornar 404 quando anuncio nao existe', async () => {
        createCandidaturaServiceMock.execute.mockRejectedValue(new Error(MENSAGEM_ANUNCIO_NAO_ENCONTRADO));
        const resposta = criarMocksResposta();

        await candidaturaController.createPublica(
            { params: { id: 'x' }, body: {}, file: {} },
            resposta,
            jest.fn()
        );

        expect(resposta.status).toHaveBeenCalledWith(404);
    });

    it('listByAnuncio deve retornar 200 com resultado do servico', async () => {
        const resultado = { candidaturas: [{ id: 'c1' }] };
        listCandidaturasServiceMock.execute.mockResolvedValue(resultado);
        const resposta = criarMocksResposta();

        await candidaturaController.listByAnuncio(
            { params: { id: 'v1' }, query: { dataInicio: '2026-01-01' } },
            resposta,
            jest.fn()
        );

        expect(listCandidaturasServiceMock.execute).toHaveBeenCalledWith('v1', {
            dataInicio: '2026-01-01',
            dataFim: undefined
        });
        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(resposta.json).toHaveBeenCalledWith(resultado);
    });

    it('listByAnuncio deve retornar 400 para periodo invalido', async () => {
        listCandidaturasServiceMock.execute.mockRejectedValue(
            new Error(MENSAGEM_PERIODO_FILTRO_INVALIDO)
        );
        const resposta = criarMocksResposta();

        await candidaturaController.listByAnuncio(
            { params: { id: 'v1' }, query: {} },
            resposta,
            jest.fn()
        );

        expect(resposta.status).toHaveBeenCalledWith(400);
    });

    it('getById deve retornar 404 quando candidatura nao existe', async () => {
        getCandidaturaServiceMock.execute.mockRejectedValue(
            new Error(MENSAGEM_CANDIDATURA_NAO_ENCONTRADA)
        );
        const resposta = criarMocksResposta();

        await candidaturaController.getById({ params: { id: 'x' } }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(404);
    });

    it('downloadCurriculo deve enviar arquivo com headers corretos', async () => {
        const buffer = Buffer.from('conteudo-pdf');
        downloadCurriculoCandidaturaServiceMock.execute.mockResolvedValue({
            bufferCurriculo: buffer,
            nomeArquivo: 'cv.pdf',
            tipoMime: 'application/pdf'
        });
        const resposta = criarMocksResposta();

        await candidaturaController.downloadCurriculo({ params: { id: 'c1' } }, resposta, jest.fn());

        expect(resposta.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(resposta.attachment).toHaveBeenCalledWith('cv.pdf');
        expect(resposta.send).toHaveBeenCalledWith(buffer);
    });

    it('downloadCurriculo deve retornar 404 quando curriculo ausente', async () => {
        downloadCurriculoCandidaturaServiceMock.execute.mockRejectedValue(
            new Error(MENSAGEM_CURRICULO_AUSENTE)
        );
        const resposta = criarMocksResposta();

        await candidaturaController.downloadCurriculo({ params: { id: 'c1' } }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(404);
    });
});
