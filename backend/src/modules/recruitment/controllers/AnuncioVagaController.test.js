import { jest } from '@jest/globals';
import {
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_CAMPOS_ATUALIZACAO_ANUNCIO_VAZIOS,
    MENSAGEM_STATUS_ANUNCIO_INVALIDO,
    MENSAGEM_TITULO_VAGA_OBRIGATORIO
} from '../constants/recrutamentoConstantes.js';

const createAnuncioVagaServiceMock = { execute: jest.fn() };
const listAnunciosVagaServiceMock = { execute: jest.fn() };
const getAnuncioVagaServiceMock = { execute: jest.fn() };
const getAnuncioVagaPublicoServiceMock = { execute: jest.fn() };
const updateAnuncioVagaServiceMock = { execute: jest.fn() };
const updateStatusAnuncioVagaServiceMock = { execute: jest.fn() };

jest.unstable_mockModule('../services/CreateAnuncioVagaService.js', () => ({
    default: createAnuncioVagaServiceMock
}));
jest.unstable_mockModule('../services/ListAnunciosVagaService.js', () => ({
    default: listAnunciosVagaServiceMock
}));
jest.unstable_mockModule('../services/GetAnuncioVagaService.js', () => ({
    default: getAnuncioVagaServiceMock
}));
jest.unstable_mockModule('../services/GetAnuncioVagaPublicoService.js', () => ({
    default: getAnuncioVagaPublicoServiceMock
}));
jest.unstable_mockModule('../services/UpdateAnuncioVagaService.js', () => ({
    default: updateAnuncioVagaServiceMock
}));
jest.unstable_mockModule('../services/UpdateStatusAnuncioVagaService.js', () => ({
    default: updateStatusAnuncioVagaServiceMock
}));

const anuncioVagaController = (await import('./AnuncioVagaController.js')).default;

function criarMocksResposta() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

function criarErroHttpTeste(mensagem, statusCode) {
    const erro = new Error(mensagem);
    erro.statusCode = statusCode;
    return erro;
}

describe('AnuncioVagaController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('create deve retornar 201 quando servico cria com sucesso', async () => {
        const anuncioCriado = { id: 'v1' };
        createAnuncioVagaServiceMock.execute.mockResolvedValue(anuncioCriado);
        const requisicao = { body: { tituloVaga: 'Dev' }, user: { id: 'user-1' } };
        const resposta = criarMocksResposta();
        const proximo = jest.fn();

        await anuncioVagaController.create(requisicao, resposta, proximo);

        expect(createAnuncioVagaServiceMock.execute).toHaveBeenCalledWith({
            tituloVaga: 'Dev',
            criadoPorUserId: 'user-1'
        });
        expect(resposta.status).toHaveBeenCalledWith(201);
        expect(resposta.json).toHaveBeenCalledWith(anuncioCriado);
        expect(proximo).not.toHaveBeenCalled();
    });

    it('create deve encaminhar erro de validacao ao next', async () => {
        createAnuncioVagaServiceMock.execute.mockRejectedValue(
            criarErroHttpTeste(MENSAGEM_TITULO_VAGA_OBRIGATORIO, 400)
        );
        const resposta = criarMocksResposta();
        const proximo = jest.fn();

        await anuncioVagaController.create({ body: {}, user: { id: '1' } }, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: MENSAGEM_TITULO_VAGA_OBRIGATORIO, statusCode: 400 })
        );
    });

    it('create deve encaminhar erro desconhecido ao next', async () => {
        createAnuncioVagaServiceMock.execute.mockRejectedValue(new Error('falha inesperada'));
        const proximo = jest.fn();

        await anuncioVagaController.create({ body: {}, user: { id: '1' } }, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(expect.any(Error));
    });

    it('list deve retornar 200 com lista de anuncios', async () => {
        const lista = [{ id: 'v1' }];
        listAnunciosVagaServiceMock.execute.mockResolvedValue(lista);
        const resposta = criarMocksResposta();

        await anuncioVagaController.list({ query: { status: 'ATIVA' } }, resposta, jest.fn());

        expect(listAnunciosVagaServiceMock.execute).toHaveBeenCalledWith({ status: 'ATIVA' });
        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(resposta.json).toHaveBeenCalledWith(lista);
    });

    it('getById deve retornar 200 quando anuncio existe', async () => {
        const anuncio = { id: 'v1' };
        getAnuncioVagaServiceMock.execute.mockResolvedValue(anuncio);
        const resposta = criarMocksResposta();

        await anuncioVagaController.getById({ params: { id: 'v1' } }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(resposta.json).toHaveBeenCalledWith(anuncio);
    });

    it('getById deve encaminhar 404 ao next quando anuncio nao existe', async () => {
        getAnuncioVagaServiceMock.execute.mockRejectedValue(
            criarErroHttpTeste(MENSAGEM_ANUNCIO_NAO_ENCONTRADO, 404)
        );
        const proximo = jest.fn();

        await anuncioVagaController.getById({ params: { id: 'x' } }, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: MENSAGEM_ANUNCIO_NAO_ENCONTRADO, statusCode: 404 })
        );
    });

    it('getPublico deve encaminhar 404 ao next quando anuncio nao esta ativo', async () => {
        getAnuncioVagaPublicoServiceMock.execute.mockRejectedValue(
            criarErroHttpTeste(MENSAGEM_ANUNCIO_NAO_ATIVO, 404)
        );
        const proximo = jest.fn();

        await anuncioVagaController.getPublico({ params: { id: 'v1' } }, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: MENSAGEM_ANUNCIO_NAO_ATIVO, statusCode: 404 })
        );
    });

    it('update deve retornar 200 quando servico atualiza com sucesso', async () => {
        const atualizado = { id: 'v1', tituloVaga: 'Novo' };
        updateAnuncioVagaServiceMock.execute.mockResolvedValue(atualizado);
        const resposta = criarMocksResposta();

        await anuncioVagaController.update(
            { params: { id: 'v1' }, body: { tituloVaga: 'Novo' } },
            resposta,
            jest.fn()
        );

        expect(updateAnuncioVagaServiceMock.execute).toHaveBeenCalledWith('v1', { tituloVaga: 'Novo' });
        expect(resposta.status).toHaveBeenCalledWith(200);
    });

    it('update deve tratar body null como objeto vazio', async () => {
        updateAnuncioVagaServiceMock.execute.mockRejectedValue(
            criarErroHttpTeste(MENSAGEM_CAMPOS_ATUALIZACAO_ANUNCIO_VAZIOS, 400)
        );
        const proximo = jest.fn();

        await anuncioVagaController.update(
            { params: { id: 'v1' }, body: null },
            criarMocksResposta(),
            proximo
        );

        expect(updateAnuncioVagaServiceMock.execute).toHaveBeenCalledWith('v1', {});
    });

    it('update deve encaminhar 400 ao next quando campos de atualizacao estao vazios', async () => {
        updateAnuncioVagaServiceMock.execute.mockRejectedValue(
            criarErroHttpTeste(MENSAGEM_CAMPOS_ATUALIZACAO_ANUNCIO_VAZIOS, 400)
        );
        const proximo = jest.fn();

        await anuncioVagaController.update(
            { params: { id: 'v1' }, body: {} },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: MENSAGEM_CAMPOS_ATUALIZACAO_ANUNCIO_VAZIOS, statusCode: 400 })
        );
    });

    it('updateStatus deve encaminhar 400 ao next para status invalido', async () => {
        updateStatusAnuncioVagaServiceMock.execute.mockRejectedValue(
            criarErroHttpTeste(MENSAGEM_STATUS_ANUNCIO_INVALIDO, 400)
        );
        const proximo = jest.fn();

        await anuncioVagaController.updateStatus(
            { params: { id: 'v1' }, body: { status: 'INVALIDO' } },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: MENSAGEM_STATUS_ANUNCIO_INVALIDO, statusCode: 400 })
        );
    });

    it('list deve encaminhar erro ao next', async () => {
        listAnunciosVagaServiceMock.execute.mockRejectedValue(new Error('falha listagem'));
        const proximo = jest.fn();

        await anuncioVagaController.list({ query: {} }, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(expect.any(Error));
    });

    it('getPublico deve retornar 200 quando anuncio esta ativo', async () => {
        const anuncio = { id: 'v1', tituloVaga: 'Dev' };
        getAnuncioVagaPublicoServiceMock.execute.mockResolvedValue(anuncio);
        const resposta = criarMocksResposta();

        await anuncioVagaController.getPublico({ params: { id: 'v1' } }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(resposta.json).toHaveBeenCalledWith(anuncio);
    });

    it('updateStatus deve retornar 200 quando status e atualizado', async () => {
        const atualizado = { id: 'v1', status: 'ATIVA' };
        updateStatusAnuncioVagaServiceMock.execute.mockResolvedValue(atualizado);
        const resposta = criarMocksResposta();

        await anuncioVagaController.updateStatus(
            { params: { id: 'v1' }, body: { status: 'ATIVA' } },
            resposta,
            jest.fn()
        );

        expect(updateStatusAnuncioVagaServiceMock.execute).toHaveBeenCalledWith('v1', {
            status: 'ATIVA'
        });
        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(resposta.json).toHaveBeenCalledWith(atualizado);
    });
});
