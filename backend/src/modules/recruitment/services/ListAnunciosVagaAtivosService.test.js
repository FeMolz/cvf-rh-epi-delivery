import { jest } from '@jest/globals';
import { STATUS_ANUNCIO_VAGA } from '../constants/recrutamentoConstantes.js';

const anuncioVagaRepositoryMock = { findMany: jest.fn() };

jest.unstable_mockModule('../repositories/AnuncioVagaRepository.js', () => ({
    default: anuncioVagaRepositoryMock
}));

const listAnunciosVagaAtivosService = (await import('./ListAnunciosVagaAtivosService.js')).default;

describe('ListAnunciosVagaAtivosService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve listar apenas vagas ativas', async () => {
        anuncioVagaRepositoryMock.findMany.mockResolvedValue([{ id: 'v1' }]);

        const resultado = await listAnunciosVagaAtivosService.execute();

        expect(anuncioVagaRepositoryMock.findMany).toHaveBeenCalledWith({
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });
        expect(resultado).toEqual([{ id: 'v1' }]);
    });
});
