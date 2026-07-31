import { jest } from '@jest/globals';
import {
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_IDENTIFICADOR_CANDIDATURA_OBRIGATORIO,
    MENSAGEM_STATUS_CANDIDATURA_INVALIDO,
    MENSAGEM_STATUS_CANDIDATURA_NAO_ALTERAVEL,
    STATUS_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';

const candidaturaRepositoryMock = { findById: jest.fn(), update: jest.fn() };

jest.unstable_mockModule('../repositories/CandidaturaRepository.js', () => ({
    default: candidaturaRepositoryMock
}));

const atualizarStatusCandidaturaService = (await import('./AtualizarStatusCandidaturaService.js')).default;

describe('AtualizarStatusCandidaturaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve atualizar status para proxima fase', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.PENDENTE
        });
        candidaturaRepositoryMock.update.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.PROXIMA_FASE
        });

        const resultado = await atualizarStatusCandidaturaService.execute('c1', {
            status: STATUS_CANDIDATURA.PROXIMA_FASE
        });

        expect(candidaturaRepositoryMock.update).toHaveBeenCalledWith('c1', {
            status: STATUS_CANDIDATURA.PROXIMA_FASE,
            descartadoEm: null
        });
        expect(resultado.status).toBe(STATUS_CANDIDATURA.PROXIMA_FASE);
    });

    it('deve definir descartadoEm ao descartar candidatura', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.PENDENTE
        });
        candidaturaRepositoryMock.update.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.DESCARTADO
        });

        await atualizarStatusCandidaturaService.execute('c1', {
            status: STATUS_CANDIDATURA.DESCARTADO
        });

        expect(candidaturaRepositoryMock.update).toHaveBeenCalledWith(
            'c1',
            expect.objectContaining({
                status: STATUS_CANDIDATURA.DESCARTADO,
                descartadoEm: expect.any(Date)
            })
        );
    });

    it('deve rejeitar identificador vazio', async () => {
        await expect(
            atualizarStatusCandidaturaService.execute('', { status: STATUS_CANDIDATURA.DESCARTADO })
        ).rejects.toThrow(MENSAGEM_IDENTIFICADOR_CANDIDATURA_OBRIGATORIO);
    });

    it('deve rejeitar status invalido', async () => {
        await expect(
            atualizarStatusCandidaturaService.execute('c1', { status: 'PENDENTE' })
        ).rejects.toThrow(MENSAGEM_STATUS_CANDIDATURA_INVALIDO);

        await expect(
            atualizarStatusCandidaturaService.execute('c1', { status: 123 })
        ).rejects.toThrow(MENSAGEM_STATUS_CANDIDATURA_INVALIDO);
    });

    it('deve rejeitar candidatura inexistente', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue(null);

        await expect(
            atualizarStatusCandidaturaService.execute('c1', { status: STATUS_CANDIDATURA.DESCARTADO })
        ).rejects.toThrow(MENSAGEM_CANDIDATURA_NAO_ENCONTRADA);
    });

    it('deve rejeitar alteracao de candidatura ja descartada', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.DESCARTADO
        });

        await expect(
            atualizarStatusCandidaturaService.execute('c1', { status: STATUS_CANDIDATURA.PROXIMA_FASE })
        ).rejects.toThrow(MENSAGEM_STATUS_CANDIDATURA_NAO_ALTERAVEL);
    });
});
