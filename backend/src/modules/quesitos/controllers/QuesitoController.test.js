import { jest } from '@jest/globals';
import {
    MENSAGEM_CAMPOS_ATUALIZACAO_QUESITO_VAZIOS,
    MENSAGEM_FILTROS_NOME_E_BLOCO_EXCLUSIVOS,
    MENSAGEM_NOME_QUESITO_OBRIGATORIO,
    MENSAGEM_QUESITO_NAO_ENCONTRADO
} from '../constants/quesitoConstantes.js';

const createQuesitoServiceMock = {
    execute: jest.fn()
};

const listQuesitosServiceMock = {
    execute: jest.fn()
};

const listAllQuesitosServiceMock = {
    execute: jest.fn()
};

const updateQuesitoServiceMock = {
    execute: jest.fn()
};

const deleteQuesitoServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../services/CreateQuesitoService.js', () => ({
    default: createQuesitoServiceMock
}));

jest.unstable_mockModule('../services/ListAllQuesitosService.js', () => ({
    default: listAllQuesitosServiceMock
}));

jest.unstable_mockModule('../services/ListQuesitosService.js', () => ({
    default: listQuesitosServiceMock
}));

jest.unstable_mockModule('../services/UpdateQuesitoService.js', () => ({
    default: updateQuesitoServiceMock
}));

jest.unstable_mockModule('../services/DeleteQuesitoService.js', () => ({
    default: deleteQuesitoServiceMock
}));

const quesitoController = (await import('./QuesitoController.js')).default;

describe('QuesitoController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('create deve retornar 201 quando servico cria com sucesso', async () => {
        const criado = { id: '1' };
        createQuesitoServiceMock.execute.mockResolvedValue(criado);
        const mockReq = { body: { nome: 'n', descricao: 'd', bloco: 'b' } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();

        await quesitoController.create(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(criado);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('create deve retornar 400 para erro de validacao conhecido', async () => {
        createQuesitoServiceMock.execute.mockRejectedValue(
            new Error(MENSAGEM_NOME_QUESITO_OBRIGATORIO)
        );
        const mockReq = { body: {} };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();

        await quesitoController.create(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('create deve encaminhar erro desconhecido ao next', async () => {
        createQuesitoServiceMock.execute.mockRejectedValue(new Error('falha inesperada'));
        const mockReq = { body: {} };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();

        await quesitoController.create(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('listAll deve retornar 200 com todos os quesitos', async () => {
        const lista = [{ id: '1' }, { id: '2' }];
        listAllQuesitosServiceMock.execute.mockResolvedValue(lista);
        const mockReq = {};
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();

        await quesitoController.listAll(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(lista);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('list deve retornar 200 com lista', async () => {
        const lista = [{ id: '1' }];
        listQuesitosServiceMock.execute.mockResolvedValue(lista);
        const mockReq = { query: {} };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();

        await quesitoController.list(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(lista);
    });

    it('update deve retornar 200 quando servico atualiza com sucesso', async () => {
        const atualizado = { id: '1', nome: 'n', descricao: 'd', bloco: 'b' };
        updateQuesitoServiceMock.execute.mockResolvedValue(atualizado);
        const mockReq = { params: { id: '1' }, body: { descricao: 'nova' } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();

        await quesitoController.update(mockReq, mockRes, mockNext);

        expect(updateQuesitoServiceMock.execute).toHaveBeenCalledWith('1', { descricao: 'nova' });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(atualizado);
    });

    it('update deve retornar 404 quando quesito nao existe', async () => {
        updateQuesitoServiceMock.execute.mockRejectedValue(new Error(MENSAGEM_QUESITO_NAO_ENCONTRADO));
        const mockReq = { params: { id: '99' }, body: { nome: 'x' } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();

        await quesitoController.update(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('list deve retornar 404 quando quesito por nome nao existe', async () => {
        listQuesitosServiceMock.execute.mockRejectedValue(new Error(MENSAGEM_QUESITO_NAO_ENCONTRADO));
        const mockReq = { query: { nome: 'x' } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();

        await quesitoController.list(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('listAll deve encaminhar erro ao next', async () => {
        const erro = new Error('falha listagem');
        listAllQuesitosServiceMock.execute.mockRejectedValue(erro);
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();

        await quesitoController.listAll({}, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(erro);
    });

    it('update deve retornar 400 para erro de validacao', async () => {
        updateQuesitoServiceMock.execute.mockRejectedValue(
            new Error(MENSAGEM_CAMPOS_ATUALIZACAO_QUESITO_VAZIOS)
        );
        const mockReq = { params: { id: '1' }, body: {} };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();

        await quesitoController.update(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('update deve usar corpo vazio quando body invalido', async () => {
        updateQuesitoServiceMock.execute.mockResolvedValue({ id: '1' });
        const mockReq = { params: { id: '1' }, body: null };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await quesitoController.update(mockReq, mockRes, jest.fn());

        expect(updateQuesitoServiceMock.execute).toHaveBeenCalledWith('1', {});
    });

    it('update deve encaminhar erro desconhecido ao next', async () => {
        const erro = new Error('falha update');
        updateQuesitoServiceMock.execute.mockRejectedValue(erro);
        const mockNext = jest.fn();

        await quesitoController.update(
            { params: { id: '1' }, body: { nome: 'x' } },
            { status: jest.fn().mockReturnThis(), json: jest.fn() },
            mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(erro);
    });

    it('delete deve retornar 200 quando servico exclui', async () => {
        deleteQuesitoServiceMock.execute.mockResolvedValue({ id: '1' });
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await quesitoController.delete({ params: { id: '1' } }, mockRes, jest.fn());

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ id: '1' });
    });

    it('delete deve retornar 404 quando quesito nao existe', async () => {
        const erro = Object.assign(new Error(MENSAGEM_QUESITO_NAO_ENCONTRADO), { statusCode: 404 });
        deleteQuesitoServiceMock.execute.mockRejectedValue(erro);
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await quesitoController.delete({ params: { id: '99' } }, mockRes, jest.fn());

        expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('delete deve encaminhar erro desconhecido ao next', async () => {
        const erro = new Error('falha delete');
        deleteQuesitoServiceMock.execute.mockRejectedValue(erro);
        const mockNext = jest.fn();

        await quesitoController.delete(
            { params: { id: '1' } },
            { status: jest.fn().mockReturnThis(), json: jest.fn() },
            mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(erro);
    });

    it('list deve retornar 400 para filtro invalido', async () => {
        listQuesitosServiceMock.execute.mockRejectedValue(
            new Error(MENSAGEM_FILTROS_NOME_E_BLOCO_EXCLUSIVOS)
        );
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await quesitoController.list({ query: { nome: 'x', bloco: 'y' } }, mockRes, jest.fn());

        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('list deve encaminhar erro desconhecido ao next', async () => {
        const erro = new Error('falha list');
        listQuesitosServiceMock.execute.mockRejectedValue(erro);
        const mockNext = jest.fn();

        await quesitoController.list(
            { query: {} },
            { status: jest.fn().mockReturnThis(), json: jest.fn() },
            mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(erro);
    });
});
