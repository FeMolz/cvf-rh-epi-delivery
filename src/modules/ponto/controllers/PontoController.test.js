import { jest } from '@jest/globals';

const obterResumoBatidasDiaServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../services/ObterResumoBatidasDiaService.js', () => ({
    default: obterResumoBatidasDiaServiceMock
}));

const pontoController = (await import('./PontoController.js')).default;

describe('PontoController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar resumo de batidas com status 200', async () => {
        const resumoMock = {
            dataReferencia: '2026-05-22',
            totais: { ativos: 1, comBatida: 1, semBatida: 0 },
            comBatida: [],
            semBatida: []
        };

        obterResumoBatidasDiaServiceMock.execute.mockResolvedValue(resumoMock);

        const request = { query: { data: '2026-05-22' } };
        const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await pontoController.obterResumo(request, response, next);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith(resumoMock);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve encaminhar erro para o middleware global', async () => {
        const erro = new Error('falha');
        erro.statusCode = 502;

        obterResumoBatidasDiaServiceMock.execute.mockRejectedValue(erro);

        const request = { query: {} };
        const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await pontoController.obterResumo(request, response, next);

        expect(next).toHaveBeenCalledWith(erro);
    });
});
