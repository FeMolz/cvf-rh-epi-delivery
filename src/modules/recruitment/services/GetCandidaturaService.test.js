import { jest } from '@jest/globals';
import { MENSAGEM_CANDIDATURA_NAO_ENCONTRADA } from '../constants/recrutamentoConstantes.js';

const candidaturaRepositoryMock = { findById: jest.fn() };

jest.unstable_mockModule('../repositories/CandidaturaRepository.js', () => ({
    default: candidaturaRepositoryMock
}));

const getCandidaturaService = (await import('./GetCandidaturaService.js')).default;

describe('GetCandidaturaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar candidatura quando encontrada', async () => {
        const candidatura = { id: 'c1', nomeCompleto: 'Maria' };
        candidaturaRepositoryMock.findById.mockResolvedValue(candidatura);

        const resultado = await getCandidaturaService.execute('c1');

        expect(resultado).toEqual(candidatura);
    });

    it('deve rejeitar quando candidatura nao existe', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue(null);

        await expect(getCandidaturaService.execute('x')).rejects.toThrow(
            MENSAGEM_CANDIDATURA_NAO_ENCONTRADA
        );
    });
});
