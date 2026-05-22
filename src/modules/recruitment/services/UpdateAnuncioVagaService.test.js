import { jest } from '@jest/globals';
import {
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_CAMPOS_ATUALIZACAO_ANUNCIO_VAZIOS,
    MENSAGEM_TIPO_CONTRATACAO_INVALIDO
} from '../constants/recrutamentoConstantes.js';

const anuncioVagaRepositoryMock = {
    findById: jest.fn(),
    update: jest.fn()
};

jest.unstable_mockModule('../repositories/AnuncioVagaRepository.js', () => ({
    default: anuncioVagaRepositoryMock
}));

const updateAnuncioVagaService = (await import('./UpdateAnuncioVagaService.js')).default;

describe('UpdateAnuncioVagaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve atualizar campos informados', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({ id: 'v1' });
        anuncioVagaRepositoryMock.update.mockResolvedValue({ id: 'v1', tituloVaga: 'Novo' });

        const resultado = await updateAnuncioVagaService.execute('v1', { tituloVaga: ' Novo ' });

        expect(anuncioVagaRepositoryMock.update).toHaveBeenCalledWith('v1', { tituloVaga: 'Novo' });
        expect(resultado.tituloVaga).toBe('Novo');
    });

    it('deve rejeitar anuncio inexistente', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue(null);

        await expect(updateAnuncioVagaService.execute('x', { tituloVaga: 'A' })).rejects.toThrow(
            MENSAGEM_ANUNCIO_NAO_ENCONTRADO
        );
    });

    it('deve rejeitar atualizacao sem campos', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({ id: 'v1' });

        await expect(updateAnuncioVagaService.execute('v1', {})).rejects.toThrow(
            MENSAGEM_CAMPOS_ATUALIZACAO_ANUNCIO_VAZIOS
        );
    });

    it('deve rejeitar tipo de contratacao invalido', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({ id: 'v1' });

        await expect(
            updateAnuncioVagaService.execute('v1', { tipoContratacao: 'INVALIDO' })
        ).rejects.toThrow(MENSAGEM_TIPO_CONTRATACAO_INVALIDO);
    });

    it('deve permitir limpar faixa salarial', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({ id: 'v1' });
        anuncioVagaRepositoryMock.update.mockResolvedValue({ id: 'v1', faixaSalarial: null });

        await updateAnuncioVagaService.execute('v1', { faixaSalarial: '   ' });

        expect(anuncioVagaRepositoryMock.update).toHaveBeenCalledWith('v1', { faixaSalarial: null });
    });
});
