import { jest } from '@jest/globals';
import {
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_CURRICULO_AUSENTE,
    MENSAGEM_EMAIL_OBRIGATORIO,
    MENSAGEM_PERIODO_FILTRO_INVALIDO
} from '../constants/recrutamentoConstantes.js';

const createCandidaturaServiceMock = { execute: jest.fn() };
const createCandidaturaAutenticadaServiceMock = { execute: jest.fn() };
const atualizarStatusCandidaturaServiceMock = { execute: jest.fn() };
const marcarVisualizacaoCandidaturaServiceMock = { execute: jest.fn() };
const listTodasCandidaturasServiceMock = { execute: jest.fn() };
const reativarCandidaturaServiceMock = { execute: jest.fn() };
const listCandidaturasServiceMock = { execute: jest.fn() };
const getCandidaturaServiceMock = { execute: jest.fn() };
const downloadCurriculoCandidaturaServiceMock = { execute: jest.fn() };

jest.unstable_mockModule('../services/CreateCandidaturaService.js', () => ({
    default: createCandidaturaServiceMock
}));
jest.unstable_mockModule('../services/CreateCandidaturaAutenticadaService.js', () => ({
    default: createCandidaturaAutenticadaServiceMock
}));
jest.unstable_mockModule('../services/AtualizarStatusCandidaturaService.js', () => ({
    default: atualizarStatusCandidaturaServiceMock
}));
jest.unstable_mockModule('../services/MarcarVisualizacaoCandidaturaService.js', () => ({
    default: marcarVisualizacaoCandidaturaServiceMock
}));
jest.unstable_mockModule('../services/ListTodasCandidaturasService.js', () => ({
    default: listTodasCandidaturasServiceMock
}));
jest.unstable_mockModule('../services/ReativarCandidaturaService.js', () => ({
    default: reativarCandidaturaServiceMock
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

function criarErroHttpTeste(mensagem, statusCode) {
    const erro = new Error(mensagem);
    erro.statusCode = statusCode;
    return erro;
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

    it('createPublica deve encaminhar 400 ao next para email obrigatorio', async () => {
        createCandidaturaServiceMock.execute.mockRejectedValue(
            criarErroHttpTeste(MENSAGEM_EMAIL_OBRIGATORIO, 400)
        );
        const proximo = jest.fn();

        await candidaturaController.createPublica(
            { params: { id: 'v1' }, body: {}, file: null },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: MENSAGEM_EMAIL_OBRIGATORIO, statusCode: 400 })
        );
    });

    it('createPublica deve encaminhar 404 ao next quando anuncio nao existe', async () => {
        createCandidaturaServiceMock.execute.mockRejectedValue(
            criarErroHttpTeste(MENSAGEM_ANUNCIO_NAO_ENCONTRADO, 404)
        );
        const proximo = jest.fn();

        await candidaturaController.createPublica(
            { params: { id: 'x' }, body: {}, file: {} },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: MENSAGEM_ANUNCIO_NAO_ENCONTRADO, statusCode: 404 })
        );
    });

    it('createAutenticada deve retornar 201 quando candidatura e criada', async () => {
        const candidatura = { id: 'c1' };
        createCandidaturaAutenticadaServiceMock.execute.mockResolvedValue(candidatura);
        const requisicao = {
            params: { id: 'v1' },
            user: { id: 'u1' },
            body: { telefone: '11999999999' },
            file: { buffer: Buffer.from('pdf') }
        };
        const resposta = criarMocksResposta();

        await candidaturaController.createAutenticada(requisicao, resposta, jest.fn());

        expect(createCandidaturaAutenticadaServiceMock.execute).toHaveBeenCalledWith(
            'v1',
            'u1',
            requisicao.body,
            requisicao.file
        );
        expect(resposta.status).toHaveBeenCalledWith(201);
        expect(resposta.json).toHaveBeenCalledWith(candidatura);
    });

    it('createAutenticada deve encaminhar erro ao next', async () => {
        createCandidaturaAutenticadaServiceMock.execute.mockRejectedValue(new Error('falha autenticada'));
        const proximo = jest.fn();

        await candidaturaController.createAutenticada(
            { params: { id: 'v1' }, user: { id: 'u1' }, body: {}, file: null },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(expect.any(Error));
    });

    it('atualizarStatus deve retornar 200 quando status e atualizado', async () => {
        const candidatura = { id: 'c1', status: 'PROXIMA_FASE' };
        atualizarStatusCandidaturaServiceMock.execute.mockResolvedValue(candidatura);
        const resposta = criarMocksResposta();

        await candidaturaController.atualizarStatus(
            { params: { id: 'c1' }, body: { status: 'PROXIMA_FASE' } },
            resposta,
            jest.fn()
        );

        expect(atualizarStatusCandidaturaServiceMock.execute).toHaveBeenCalledWith('c1', {
            status: 'PROXIMA_FASE'
        });
        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(resposta.json).toHaveBeenCalledWith(candidatura);
    });

    it('atualizarStatus deve encaminhar erro ao next', async () => {
        atualizarStatusCandidaturaServiceMock.execute.mockRejectedValue(new Error('status invalido'));
        const proximo = jest.fn();

        await candidaturaController.atualizarStatus(
            { params: { id: 'c1' }, body: { status: 'X' } },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(expect.any(Error));
    });

    it('marcarVisualizacao deve retornar 200 quando visualizacao e registrada', async () => {
        const candidatura = { id: 'c1', descricaoVisualizadaEm: '2026-01-01' };
        marcarVisualizacaoCandidaturaServiceMock.execute.mockResolvedValue(candidatura);
        const resposta = criarMocksResposta();

        await candidaturaController.marcarVisualizacao(
            { params: { id: 'c1' }, body: { tipo: 'DESCRICAO' } },
            resposta,
            jest.fn()
        );

        expect(marcarVisualizacaoCandidaturaServiceMock.execute).toHaveBeenCalledWith('c1', {
            tipo: 'DESCRICAO'
        });
        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(resposta.json).toHaveBeenCalledWith(candidatura);
    });

    it('marcarVisualizacao deve encaminhar erro ao next', async () => {
        marcarVisualizacaoCandidaturaServiceMock.execute.mockRejectedValue(new Error('tipo invalido'));
        const proximo = jest.fn();

        await candidaturaController.marcarVisualizacao(
            { params: { id: 'c1' }, body: {} },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(expect.any(Error));
    });

    it('list deve retornar 200 com resultado do servico', async () => {
        const resultado = { candidaturas: [{ id: 'c1' }], totalCandidaturas: 1 };
        listTodasCandidaturasServiceMock.execute.mockResolvedValue(resultado);
        const resposta = criarMocksResposta();

        await candidaturaController.list(
            {
                query: {
                    anuncioVagaId: 'v1',
                    dataInicio: '2026-01-01',
                    status: 'PENDENTE',
                    incluirDescartadas: 'true',
                    reativados: 'false',
                    ordenacao: 'RECENTES'
                }
            },
            resposta,
            jest.fn()
        );

        expect(listTodasCandidaturasServiceMock.execute).toHaveBeenCalledWith({
            anuncioVagaId: 'v1',
            dataInicio: '2026-01-01',
            dataFim: undefined,
            status: 'PENDENTE',
            incluirDescartadas: 'true',
            reativados: 'false',
            ordenacao: 'RECENTES'
        });
        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(resposta.json).toHaveBeenCalledWith(resultado);
    });

    it('list deve encaminhar erro ao next', async () => {
        listTodasCandidaturasServiceMock.execute.mockRejectedValue(new Error('falha listagem'));
        const proximo = jest.fn();

        await candidaturaController.list({ query: {} }, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(expect.any(Error));
    });

    it('reativar deve retornar 200 com resultado do servico', async () => {
        const resultado = { candidatura: { id: 'c1' }, destino: 'REATIVADOS' };
        reativarCandidaturaServiceMock.execute.mockResolvedValue(resultado);
        const resposta = criarMocksResposta();

        await candidaturaController.reativar({ params: { id: 'c1' } }, resposta, jest.fn());

        expect(reativarCandidaturaServiceMock.execute).toHaveBeenCalledWith('c1');
        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(resposta.json).toHaveBeenCalledWith(resultado);
    });

    it('reativar deve encaminhar erro ao next', async () => {
        reativarCandidaturaServiceMock.execute.mockRejectedValue(new Error('nao pode reativar'));
        const proximo = jest.fn();

        await candidaturaController.reativar({ params: { id: 'c1' } }, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(expect.any(Error));
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
            dataFim: undefined,
            status: undefined,
            incluirDescartadas: undefined
        });
        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(resposta.json).toHaveBeenCalledWith(resultado);
    });

    it('listByAnuncio deve encaminhar 400 ao next para periodo invalido', async () => {
        listCandidaturasServiceMock.execute.mockRejectedValue(
            criarErroHttpTeste(MENSAGEM_PERIODO_FILTRO_INVALIDO, 400)
        );
        const proximo = jest.fn();

        await candidaturaController.listByAnuncio(
            { params: { id: 'v1' }, query: {} },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: MENSAGEM_PERIODO_FILTRO_INVALIDO, statusCode: 400 })
        );
    });

    it('getById deve retornar 200 quando candidatura existe', async () => {
        const candidatura = { id: 'c1', nomeCompleto: 'Maria' };
        getCandidaturaServiceMock.execute.mockResolvedValue(candidatura);
        const resposta = criarMocksResposta();

        await candidaturaController.getById({ params: { id: 'c1' } }, resposta, jest.fn());

        expect(getCandidaturaServiceMock.execute).toHaveBeenCalledWith('c1');
        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(resposta.json).toHaveBeenCalledWith(candidatura);
    });

    it('getById deve encaminhar 404 ao next quando candidatura nao existe', async () => {
        getCandidaturaServiceMock.execute.mockRejectedValue(
            criarErroHttpTeste(MENSAGEM_CANDIDATURA_NAO_ENCONTRADA, 404)
        );
        const proximo = jest.fn();

        await candidaturaController.getById({ params: { id: 'x' } }, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: MENSAGEM_CANDIDATURA_NAO_ENCONTRADA, statusCode: 404 })
        );
    });

    it('downloadCurriculo deve enviar arquivo com headers corretos', async () => {
        const buffer = Buffer.from('conteudo-pdf');
        downloadCurriculoCandidaturaServiceMock.execute.mockResolvedValue({
            bufferCurriculo: buffer,
            nomeArquivo: 'cv.pdf',
            tipoMime: 'application/pdf'
        });
        const resposta = criarMocksResposta();

        await candidaturaController.downloadCurriculo(
            { params: { id: 'c1' }, user: { id: 'u1', role: 'ADMIN' } },
            resposta,
            jest.fn()
        );

        expect(downloadCurriculoCandidaturaServiceMock.execute).toHaveBeenCalledWith('c1', {
            identificadorUsuario: 'u1',
            papelUsuario: 'ADMIN'
        });
        expect(resposta.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(resposta.attachment).toHaveBeenCalledWith('cv.pdf');
        expect(resposta.send).toHaveBeenCalledWith(buffer);
    });

    it('downloadCurriculo deve encaminhar 404 ao next quando curriculo ausente', async () => {
        downloadCurriculoCandidaturaServiceMock.execute.mockRejectedValue(
            criarErroHttpTeste(MENSAGEM_CURRICULO_AUSENTE, 404)
        );
        const proximo = jest.fn();

        await candidaturaController.downloadCurriculo(
            { params: { id: 'c1' }, user: {} },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: MENSAGEM_CURRICULO_AUSENTE, statusCode: 404 })
        );
    });
});
