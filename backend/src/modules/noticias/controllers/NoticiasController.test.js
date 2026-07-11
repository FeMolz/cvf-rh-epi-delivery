import { jest } from '@jest/globals';

const listarAniversariantesNoticiasServiceMock = {
    execute: jest.fn()
};

const listarAfastamentosNoticiasServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../services/ListarAniversariantesNoticiasService.js', () => ({
    default: listarAniversariantesNoticiasServiceMock
}));

jest.unstable_mockModule('../services/ListarAfastamentosNoticiasService.js', () => ({
    default: listarAfastamentosNoticiasServiceMock
}));

const noticiasController = (await import('./NoticiasController.js')).default;

describe('NoticiasController', () => {
    let mockRequest;
    let mockResponse;
    let next;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('deve retornar aniversariantes com status 200', async () => {
        const payload = {
            mesReferencia: 'junho de 2025',
            aniversariantesPessoais: [],
            aniversariantesEmpresa: []
        };

        listarAniversariantesNoticiasServiceMock.execute.mockResolvedValue(payload);

        await noticiasController.listarAniversariantes(mockRequest, mockResponse, next);

        expect(listarAniversariantesNoticiasServiceMock.execute).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payload);
    });

    it('deve retornar afastamentos com status 200', async () => {
        const payload = {
            mesReferencia: 'junho de 2025',
            saindo: [],
            voltando: []
        };

        listarAfastamentosNoticiasServiceMock.execute.mockResolvedValue(payload);

        await noticiasController.listarAfastamentos(mockRequest, mockResponse, next);

        expect(listarAfastamentosNoticiasServiceMock.execute).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payload);
    });

    it('deve repassar erro para o middleware global', async () => {
        const erro = new Error('Falha inesperada');
        listarAniversariantesNoticiasServiceMock.execute.mockRejectedValue(erro);

        await noticiasController.listarAniversariantes(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve repassar erro de afastamentos para o middleware global', async () => {
        const erro = new Error('Falha afastamentos');
        listarAfastamentosNoticiasServiceMock.execute.mockRejectedValue(erro);

        await noticiasController.listarAfastamentos(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });
});
