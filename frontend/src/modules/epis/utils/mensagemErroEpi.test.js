import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import {
    DURACAO_MENSAGEM_ERRO_EPI_MS,
    MENSAGEM_EPI_CA_NAO_ENCONTRADO,
    erroEpiDeveSerTemporario,
    useMensagemTemporaria
} from './mensagemErroEpi.js';

describe('mensagemErroEpi', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('deve identificar mensagem de ca nao encontrado como temporaria', () => {
        expect(erroEpiDeveSerTemporario(MENSAGEM_EPI_CA_NAO_ENCONTRADO)).toBe(true);
        expect(erroEpiDeveSerTemporario('Outro erro')).toBe(false);
    });

    it('deve ocultar mensagem temporaria apos 2 segundos', () => {
        const { result } = renderHook(() => useMensagemTemporaria());

        act(() => {
            result.current.definirMensagem(MENSAGEM_EPI_CA_NAO_ENCONTRADO, { temporario: true });
        });

        expect(result.current.mensagem).toBe(MENSAGEM_EPI_CA_NAO_ENCONTRADO);

        act(() => {
            vi.advanceTimersByTime(DURACAO_MENSAGEM_ERRO_EPI_MS);
        });

        expect(result.current.mensagem).toBe('');
    });

    it('deve ocultar qualquer mensagem apos 2 segundos por padrao', () => {
        const { result } = renderHook(() => useMensagemTemporaria());

        act(() => {
            result.current.definirMensagem('Erro de carregamento');
        });

        expect(result.current.mensagem).toBe('Erro de carregamento');

        act(() => {
            vi.advanceTimersByTime(DURACAO_MENSAGEM_ERRO_EPI_MS);
        });

        expect(result.current.mensagem).toBe('');
    });
});
