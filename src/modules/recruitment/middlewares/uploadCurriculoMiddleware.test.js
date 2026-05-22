import { jest } from '@jest/globals';
import { MENSAGEM_CURRICULO_OBRIGATORIO } from '../constants/recrutamentoConstantes.js';

const handlerUploadMock = jest.fn();

const multerMock = jest.fn(() => ({
    single: jest.fn(() => handlerUploadMock)
}));

multerMock.memoryStorage = jest.fn();

jest.unstable_mockModule('multer', () => ({
    default: multerMock
}));

const { middlewareUploadCurriculo } = await import('./uploadCurriculoMiddleware.js');

function criarMocksResposta() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

describe('middlewareUploadCurriculo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve chamar next quando arquivo foi enviado', () => {
        handlerUploadMock.mockImplementation((requisicao, resposta, callback) => {
            requisicao.file = { originalname: 'cv.pdf' };
            callback(null);
        });

        const requisicao = {};
        const resposta = criarMocksResposta();
        const proximo = jest.fn();

        middlewareUploadCurriculo(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalled();
        expect(resposta.status).not.toHaveBeenCalled();
    });

    it('deve retornar 400 quando arquivo nao foi enviado', () => {
        handlerUploadMock.mockImplementation((requisicao, resposta, callback) => {
            callback(null);
        });

        const requisicao = {};
        const resposta = criarMocksResposta();
        const proximo = jest.fn();

        middlewareUploadCurriculo(requisicao, resposta, proximo);

        expect(resposta.status).toHaveBeenCalledWith(400);
        expect(resposta.json).toHaveBeenCalledWith({ error: MENSAGEM_CURRICULO_OBRIGATORIO });
        expect(proximo).not.toHaveBeenCalled();
    });

    it('deve encaminhar erro do multer ao next', () => {
        const erroMulter = new Error('arquivo muito grande');
        handlerUploadMock.mockImplementation((requisicao, resposta, callback) => {
            callback(erroMulter);
        });

        const proximo = jest.fn();

        middlewareUploadCurriculo({}, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(erroMulter);
    });
});
