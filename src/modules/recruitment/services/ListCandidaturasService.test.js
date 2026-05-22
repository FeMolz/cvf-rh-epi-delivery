import { jest } from '@jest/globals';
import { MENSAGEM_ANUNCIO_NAO_ENCONTRADO } from '../constants/recrutamentoConstantes.js';

const anuncioVagaRepositoryMock = { findById: jest.fn() };
const candidaturaRepositoryMock = {
    findManyByAnuncio: jest.fn(),
    countByAnuncio: jest.fn()
};

jest.unstable_mockModule('../repositories/AnuncioVagaRepository.js', () => ({
    default: anuncioVagaRepositoryMock
}));

jest.unstable_mockModule('../repositories/CandidaturaRepository.js', () => ({
    default: candidaturaRepositoryMock
}));

const listCandidaturasService = (await import('./ListCandidaturasService.js')).default;

describe('ListCandidaturasService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve listar candidaturas ordenadas por data asc', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            tituloVaga: 'Analista',
            status: 'ATIVA'
        });
        candidaturaRepositoryMock.findManyByAnuncio.mockResolvedValue([
            { id: 'c1', createdAt: '2026-01-01' },
            { id: 'c2', createdAt: '2026-01-02' }
        ]);
        candidaturaRepositoryMock.countByAnuncio.mockResolvedValue(2);

        const resultado = await listCandidaturasService.execute('v1', {
            dataInicio: '2026-01-01',
            dataFim: '2026-12-31'
        });

        expect(resultado.totalCandidaturas).toBe(2);
        expect(resultado.candidaturas).toHaveLength(2);
    });

    it('deve rejeitar anuncio inexistente', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue(null);

        await expect(listCandidaturasService.execute('inexistente')).rejects.toThrow(
            MENSAGEM_ANUNCIO_NAO_ENCONTRADO
        );
    });
});
