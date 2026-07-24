import { jest } from '@jest/globals';
import {
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    STATUS_ANUNCIO_VAGA
} from '../constants/recrutamentoConstantes.js';

const anuncioVagaRepositoryMock = { findById: jest.fn() };
const candidaturaRepositoryMock = { findByAnuncioAndUser: jest.fn() };

jest.unstable_mockModule('../repositories/AnuncioVagaRepository.js', () => ({
    default: anuncioVagaRepositoryMock
}));

jest.unstable_mockModule('../repositories/CandidaturaRepository.js', () => ({
    default: candidaturaRepositoryMock
}));

const getAnuncioVagaAtivoService = (await import('./GetAnuncioVagaAtivoService.js')).default;

describe('GetAnuncioVagaAtivoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar vaga ativa sem dados do criador', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA,
            tituloVaga: 'Dev',
            criadoPorUserId: 'u1',
            criadoPor: { id: 'u1' }
        });

        const resultado = await getAnuncioVagaAtivoService.execute('v1');

        expect(resultado).toMatchObject({ id: 'v1', tituloVaga: 'Dev', jaCandidatou: false });
        expect(resultado.criadoPor).toBeUndefined();
    });

    it('deve indicar quando usuario ja se candidatou', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });
        candidaturaRepositoryMock.findByAnuncioAndUser.mockResolvedValue({ id: 'c1' });

        const resultado = await getAnuncioVagaAtivoService.execute('v1', 'u1');

        expect(resultado.jaCandidatou).toBe(true);
    });

    it('deve rejeitar anuncio inexistente', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue(null);

        await expect(getAnuncioVagaAtivoService.execute('x')).rejects.toThrow(
            MENSAGEM_ANUNCIO_NAO_ENCONTRADO
        );
    });

    it('deve rejeitar anuncio inativo', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.INATIVA
        });

        await expect(getAnuncioVagaAtivoService.execute('v1')).rejects.toThrow(
            MENSAGEM_ANUNCIO_NAO_ATIVO
        );
    });
});
