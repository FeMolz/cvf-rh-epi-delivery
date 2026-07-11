import { jest } from '@jest/globals';

const fetchEpiFromApiServiceMock = { execute: jest.fn() };
const changeEpiPeriodicityServiceMock = { execute: jest.fn() };
const listCachedEpisServiceMock = { execute: jest.fn() };
const searchEpisByNameExternoServiceMock = { execute: jest.fn() };

jest.unstable_mockModule('../services/FetchEpiFromApiService.js', () => ({
    default: fetchEpiFromApiServiceMock
}));
jest.unstable_mockModule('../services/ChangeEpiPeriodicityService.js', () => ({
    default: changeEpiPeriodicityServiceMock
}));
jest.unstable_mockModule('../services/ListCachedEpisService.js', () => ({
    default: listCachedEpisServiceMock
}));
jest.unstable_mockModule('../services/SearchEpisByNameExternoService.js', () => ({
    default: searchEpisByNameExternoServiceMock
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

    it('deve retornar 200 ao buscar epis por nome', async () => {
        const requisicao = { query: { nome: 'capacete' } };
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const proximo = jest.fn();

        searchEpisByNameExternoServiceMock.execute.mockResolvedValue([
            { caNumber: '11070', name: 'Capacete' }
        ]);

        await epiController.searchByName(requisicao, resposta, proximo);

        expect(searchEpisByNameExternoServiceMock.execute).toHaveBeenCalledWith('capacete');
        expect(resposta.status).toHaveBeenCalledWith(200);
    });

    it('deve alterar periodicidade e retornar 200', async () => {
        const requisicao = {
            body: { roleId: 'r1', epiId: 'e1', newPeriodicityDays: 180 }
        };
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const proximo = jest.fn();

        changeEpiPeriodicityServiceMock.execute.mockResolvedValue({ id: 're1', periodicityDays: 180 });
        await epiController.changePeriodicity(requisicao, resposta, proximo);

        expect(changeEpiPeriodicityServiceMock.execute).toHaveBeenCalledWith({
            roleId: 'r1',
            epiId: 'e1',
            newPeriodicityDays: 180
        });
        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(proximo).not.toHaveBeenCalled();
    });

    it('deve encaminhar erro ao alterar periodicidade', async () => {
        const requisicao = { body: {} };
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const proximo = jest.fn();

        changeEpiPeriodicityServiceMock.execute.mockRejectedValue(new Error('vinculo invalido'));
        await epiController.changePeriodicity(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'vinculo invalido' })
        );
    });

    it('deve retornar 200 ao listar epis locais', async () => {
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const proximo = jest.fn();

        listCachedEpisServiceMock.execute.mockResolvedValue([{ id: 1 }]);
        await epiController.findAllLocal({}, resposta, proximo);

        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(resposta.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('deve encaminhar 500 ao falhar listagem local', async () => {
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const proximo = jest.fn();

        listCachedEpisServiceMock.execute.mockRejectedValue(new Error('db down'));
        await epiController.findAllLocal({}, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Erro ao buscar EPIs.', statusCode: 500 })
        );
    });

    it('deve encaminhar erro com statusCode customizado na busca por nome', async () => {
        const requisicao = { query: { nome: 'x' } };
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const proximo = jest.fn();
        const erro = Object.assign(new Error('nome invalido'), { statusCode: 422 });

        searchEpisByNameExternoServiceMock.execute.mockRejectedValue(erro);
        await epiController.searchByName(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'nome invalido', statusCode: 422 })
        );
    });

    it('deve usar statusCode 400 padrao na busca por nome', async () => {
        const requisicao = { query: { nome: 'x' } };
        const proximo = jest.fn();

        searchEpisByNameExternoServiceMock.execute.mockRejectedValue(new Error('nome obrigatorio'));
        await epiController.searchByName(
            requisicao,
            { status: jest.fn().mockReturnThis(), json: jest.fn() },
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'nome obrigatorio', statusCode: 400 })
        );
    });
});
