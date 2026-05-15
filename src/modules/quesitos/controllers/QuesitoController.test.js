import { jest } from '@jest/globals';

const createQuesitoServiceMock = {
    execute: jest.fn()
};

const listQuesitosServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../services/CreateQuesitoService.js', () => ({
    default: createQuesitoServiceMock
}));

jest.unstable_mockModule('../services/ListQuesitosService.js', () => ({
    default: listQuesitosServiceMock
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
        createQuesitoServiceMock.execute.mockRejectedValue(new Error('nome e obrigatorio.'));
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

    it('list deve retornar 404 quando quesito por nome nao existe', async () => {
        listQuesitosServiceMock.execute.mockRejectedValue(new Error('Quesito nao encontrado.'));
        const mockReq = { query: { nome: 'x' } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();

        await quesitoController.list(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(404);
    });
});
