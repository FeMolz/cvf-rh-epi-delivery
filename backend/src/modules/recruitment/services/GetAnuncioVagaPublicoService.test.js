import { jest } from '@jest/globals';
import {
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    STATUS_ANUNCIO_VAGA
} from '../constants/recrutamentoConstantes.js';

const anuncioVagaRepositoryMock = { findById: jest.fn() };

jest.unstable_mockModule('../repositories/AnuncioVagaRepository.js', () => ({
    default: anuncioVagaRepositoryMock
}));

const getAnuncioVagaPublicoService = (await import('./GetAnuncioVagaPublicoService.js')).default;

describe('GetAnuncioVagaPublicoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar anuncio publico sem dados do criador', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            tituloVaga: 'Dev',
            status: STATUS_ANUNCIO_VAGA.ATIVA,
            criadoPorUserId: 'u1',
            criadoPor: { id: 'u1', name: 'Admin' }
        });

        const resultado = await getAnuncioVagaPublicoService.execute('v1');

        expect(resultado.criadoPor).toBeUndefined();
        expect(resultado.criadoPorUserId).toBeUndefined();
        expect(resultado.tituloVaga).toBe('Dev');
    });

    it('deve rejeitar anuncio inativo', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.INATIVA
        });

        await expect(getAnuncioVagaPublicoService.execute('v1')).rejects.toThrow(
            MENSAGEM_ANUNCIO_NAO_ATIVO
        );
    });

    it('deve rejeitar anuncio inexistente', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue(null);

        await expect(getAnuncioVagaPublicoService.execute('x')).rejects.toThrow(
            MENSAGEM_ANUNCIO_NAO_ENCONTRADO
        );
    });
});
