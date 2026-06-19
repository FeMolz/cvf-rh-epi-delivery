import { jest } from '@jest/globals';

const fetchEpiFromApiServiceMock = { execute: jest.fn() };
const changeEpiPeriodicityServiceMock = { execute: jest.fn() };
const listCachedEpisServiceMock = { execute: jest.fn() };

jest.unstable_mockModule('../services/FetchEpiFromApiService.js', () => ({
    default: fetchEpiFromApiServiceMock
}));
jest.unstable_mockModule('../services/ChangeEpiPeriodicityService.js', () => ({
    default: changeEpiPeriodicityServiceMock
}));
jest.unstable_mockModule('../services/ListCachedEpisService.js', () => ({
    default: listCachedEpisServiceMock
}));

const epiController = (await import('./EpiController.js')).default;

describe('EpiController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar 200 ao buscar por CA', async () => {
        const requisicao = { params: { caNumber: '11070' } };
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const proximo = jest.fn();

        fetchEpiFromApiServiceMock.execute.mockResolvedValue({ id: 1 });
        await epiController.findByCa(requisicao, resposta, proximo);

        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(proximo).not.toHaveBeenCalled();
    });

    it('deve encaminhar 404 quando CA não encontrado', async () => {
        const requisicao = { params: { caNumber: '99999' } };
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const proximo = jest.fn();

        fetchEpiFromApiServiceMock.execute.mockRejectedValue(new Error('Not found'));
        await epiController.findByCa(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Not found', statusCode: 404 })
        );
    });
});
