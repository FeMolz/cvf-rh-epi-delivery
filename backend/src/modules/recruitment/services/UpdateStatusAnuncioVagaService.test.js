import { jest } from '@jest/globals';
import {
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_STATUS_ANUNCIO_INVALIDO,
    STATUS_ANUNCIO_VAGA
} from '../constants/recrutamentoConstantes.js';

const anuncioVagaRepositoryMock = {
    findById: jest.fn(),
    update: jest.fn()
};

jest.unstable_mockModule('../repositories/AnuncioVagaRepository.js', () => ({
    default: anuncioVagaRepositoryMock
}));

const updateStatusAnuncioVagaService = (await import('./UpdateStatusAnuncioVagaService.js')).default;

describe('UpdateStatusAnuncioVagaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve atualizar status para ATIVA', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({ id: 'v1', status: 'INATIVA' });
        anuncioVagaRepositoryMock.update.mockResolvedValue({ id: 'v1', status: 'ATIVA' });

        const resultado = await updateStatusAnuncioVagaService.execute('v1', { status: 'ativa' });

        expect(anuncioVagaRepositoryMock.update).toHaveBeenCalledWith('v1', {
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });
        expect(resultado.status).toBe('ATIVA');
    });

    it('deve rejeitar status invalido', async () => {
        await expect(
            updateStatusAnuncioVagaService.execute('v1', { status: 'CANCELADA' })
        ).rejects.toThrow(MENSAGEM_STATUS_ANUNCIO_INVALIDO);
    });

    it('deve rejeitar anuncio inexistente', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue(null);

        await expect(
            updateStatusAnuncioVagaService.execute('x', { status: 'ATIVA' })
        ).rejects.toThrow(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
    });

    it('deve rejeitar status nao-string', async () => {
        await expect(updateStatusAnuncioVagaService.execute('v1', { status: 123 })).rejects.toThrow(
            MENSAGEM_STATUS_ANUNCIO_INVALIDO
        );
    });
});
