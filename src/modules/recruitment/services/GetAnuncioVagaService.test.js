import { jest } from '@jest/globals';
import { MENSAGEM_ANUNCIO_NAO_ENCONTRADO } from '../constants/recrutamentoConstantes.js';

const anuncioVagaRepositoryMock = { findById: jest.fn() };

jest.unstable_mockModule('../repositories/AnuncioVagaRepository.js', () => ({
    default: anuncioVagaRepositoryMock
}));

const getAnuncioVagaService = (await import('./GetAnuncioVagaService.js')).default;

describe('GetAnuncioVagaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar anuncio quando encontrado', async () => {
        const anuncio = { id: 'v1', tituloVaga: 'Dev' };
        anuncioVagaRepositoryMock.findById.mockResolvedValue(anuncio);

        const resultado = await getAnuncioVagaService.execute('v1');

        expect(resultado).toEqual(anuncio);
    });

    it('deve rejeitar quando anuncio nao existe', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue(null);

        await expect(getAnuncioVagaService.execute('x')).rejects.toThrow(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
    });
});
