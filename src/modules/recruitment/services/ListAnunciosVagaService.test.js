import { jest } from '@jest/globals';

const anuncioVagaRepositoryMock = { findMany: jest.fn() };

jest.unstable_mockModule('../repositories/AnuncioVagaRepository.js', () => ({
    default: anuncioVagaRepositoryMock
}));

const listAnunciosVagaService = (await import('./ListAnunciosVagaService.js')).default;

describe('ListAnunciosVagaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve listar todos quando status nao informado', async () => {
        const lista = [{ id: 'v1' }, { id: 'v2' }];
        anuncioVagaRepositoryMock.findMany.mockResolvedValue(lista);

        const resultado = await listAnunciosVagaService.execute();

        expect(anuncioVagaRepositoryMock.findMany).toHaveBeenCalledWith({ status: undefined });
        expect(resultado).toEqual(lista);
    });

    it('deve filtrar por status valido', async () => {
        anuncioVagaRepositoryMock.findMany.mockResolvedValue([]);

        await listAnunciosVagaService.execute({ status: ' ativa ' });

        expect(anuncioVagaRepositoryMock.findMany).toHaveBeenCalledWith({ status: 'ATIVA' });
    });

    it('deve retornar lista vazia para status invalido', async () => {
        const resultado = await listAnunciosVagaService.execute({ status: 'INVALIDO' });

        expect(anuncioVagaRepositoryMock.findMany).not.toHaveBeenCalled();
        expect(resultado).toEqual([]);
    });
});
