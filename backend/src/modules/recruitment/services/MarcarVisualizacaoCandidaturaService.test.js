import { jest } from '@jest/globals';
import {
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_TIPO_VISUALIZACAO_CANDIDATURA_INVALIDO,
    TIPO_VISUALIZACAO_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';

const candidaturaRepositoryMock = { findById: jest.fn(), update: jest.fn() };

jest.unstable_mockModule('../repositories/CandidaturaRepository.js', () => ({
    default: candidaturaRepositoryMock
}));

const marcarVisualizacaoCandidaturaService = (
    await import('./MarcarVisualizacaoCandidaturaService.js')
).default;

describe('MarcarVisualizacaoCandidaturaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve marcar descricao visualizada', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            descricaoVisualizadaEm: null,
            curriculoVisualizadoEm: null
        });
        candidaturaRepositoryMock.update.mockResolvedValue({
            id: 'c1',
            descricaoVisualizadaEm: '2026-07-24'
        });

        const resultado = await marcarVisualizacaoCandidaturaService.execute('c1', {
            tipo: TIPO_VISUALIZACAO_CANDIDATURA.DESCRICAO
        });

        expect(candidaturaRepositoryMock.update).toHaveBeenCalledWith('c1', {
            descricaoVisualizadaEm: expect.any(Date)
        });
        expect(resultado.id).toBe('c1');
    });

    it('deve marcar curriculo visualizado', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            descricaoVisualizadaEm: null,
            curriculoVisualizadoEm: null
        });
        candidaturaRepositoryMock.update.mockResolvedValue({
            id: 'c1',
            curriculoVisualizadoEm: '2026-07-24'
        });

        await marcarVisualizacaoCandidaturaService.execute('c1', {
            tipo: 'curriculo'
        });

        expect(candidaturaRepositoryMock.update).toHaveBeenCalledWith('c1', {
            curriculoVisualizadoEm: expect.any(Date)
        });
    });

    it('nao deve atualizar quando ja visualizado', async () => {
        const candidatura = {
            id: 'c1',
            descricaoVisualizadaEm: '2026-07-01'
        };
        candidaturaRepositoryMock.findById.mockResolvedValue(candidatura);

        const resultado = await marcarVisualizacaoCandidaturaService.execute('c1', {
            tipo: TIPO_VISUALIZACAO_CANDIDATURA.DESCRICAO
        });

        expect(candidaturaRepositoryMock.update).not.toHaveBeenCalled();
        expect(resultado).toEqual(candidatura);
    });

    it('deve rejeitar tipo invalido', async () => {
        await expect(
            marcarVisualizacaoCandidaturaService.execute('c1', { tipo: 'OUTRO' })
        ).rejects.toThrow(MENSAGEM_TIPO_VISUALIZACAO_CANDIDATURA_INVALIDO);
    });

    it('deve rejeitar candidatura inexistente', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue(null);

        await expect(
            marcarVisualizacaoCandidaturaService.execute('c1', {
                tipo: TIPO_VISUALIZACAO_CANDIDATURA.DESCRICAO
            })
        ).rejects.toThrow(MENSAGEM_CANDIDATURA_NAO_ENCONTRADA);
    });
});
