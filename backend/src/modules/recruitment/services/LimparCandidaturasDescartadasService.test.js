import { jest } from '@jest/globals';
import { DIAS_RETENCAO_CANDIDATURA_DESCARTADA } from '../constants/recrutamentoConstantes.js';

const candidaturaRepositoryMock = { deleteManyDescartadasAntigas: jest.fn() };

jest.unstable_mockModule('../repositories/CandidaturaRepository.js', () => ({
    default: candidaturaRepositoryMock
}));

const limparCandidaturasDescartadasService = (
    await import('./LimparCandidaturasDescartadasService.js')
).default;

describe('LimparCandidaturasDescartadasService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve remover candidaturas descartadas antigas', async () => {
        candidaturaRepositoryMock.deleteManyDescartadasAntigas.mockResolvedValue(2);

        const resultado = await limparCandidaturasDescartadasService.execute();

        expect(candidaturaRepositoryMock.deleteManyDescartadasAntigas).toHaveBeenCalledWith(
            expect.any(Date)
        );

        const dataLimite =
            candidaturaRepositoryMock.deleteManyDescartadasAntigas.mock.calls[0][0];
        const diferencaDias = Math.round(
            (Date.now() - dataLimite.getTime()) / (24 * 60 * 60 * 1000)
        );

        expect(diferencaDias).toBe(DIAS_RETENCAO_CANDIDATURA_DESCARTADA);
        expect(resultado).toBe(2);
    });
});
