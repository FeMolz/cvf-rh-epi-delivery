import { jest } from '@jest/globals';
import {
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_CANDIDATURA_NAO_PODE_REATIVAR,
    STATUS_ANUNCIO_VAGA,
    STATUS_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';

const candidaturaRepositoryMock = { findById: jest.fn(), update: jest.fn() };

jest.unstable_mockModule('../repositories/CandidaturaRepository.js', () => ({
    default: candidaturaRepositoryMock
}));

const { DESTINO_REATIVACAO_CANDIDATURA } = await import('./ReativarCandidaturaService.js');
const reativarCandidaturaService = (await import('./ReativarCandidaturaService.js')).default;

describe('ReativarCandidaturaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve reativar candidatura sempre para a aba reativados', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.DESCARTADO,
            anuncioVaga: { status: STATUS_ANUNCIO_VAGA.ATIVA }
        });
        candidaturaRepositoryMock.update.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.PENDENTE,
            reativadoEm: '2026-07-24'
        });

        const resultado = await reativarCandidaturaService.execute('c1');

        expect(candidaturaRepositoryMock.update).toHaveBeenCalledWith('c1', {
            status: STATUS_CANDIDATURA.PENDENTE,
            descartadoEm: null,
            reativadoEm: expect.any(Date)
        });
        expect(resultado.destino).toBe(DESTINO_REATIVACAO_CANDIDATURA.REATIVADOS);
    });

    it('deve reativar candidatura com vaga encerrada para a aba reativados', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.DESCARTADO,
            anuncioVaga: { status: STATUS_ANUNCIO_VAGA.ENCERRADA }
        });
        candidaturaRepositoryMock.update.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.PENDENTE,
            reativadoEm: '2026-01-01'
        });

        const resultado = await reativarCandidaturaService.execute('c1');

        expect(candidaturaRepositoryMock.update).toHaveBeenCalledWith(
            'c1',
            expect.objectContaining({
                status: STATUS_CANDIDATURA.PENDENTE,
                descartadoEm: null,
                reativadoEm: expect.any(Date)
            })
        );
        expect(resultado.destino).toBe(DESTINO_REATIVACAO_CANDIDATURA.REATIVADOS);
    });

    it('deve rejeitar reativacao de candidatura que nao esta descartada', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.PENDENTE,
            anuncioVaga: { status: STATUS_ANUNCIO_VAGA.ATIVA }
        });

        await expect(reativarCandidaturaService.execute('c1')).rejects.toThrow(
            MENSAGEM_CANDIDATURA_NAO_PODE_REATIVAR
        );
    });

    it('deve rejeitar candidatura inexistente', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue(null);

        await expect(reativarCandidaturaService.execute('c1')).rejects.toThrow(
            MENSAGEM_CANDIDATURA_NAO_ENCONTRADA
        );
    });
});
