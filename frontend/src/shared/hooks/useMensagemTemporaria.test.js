import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import {
    DURACAO_MENSAGEM_FEEDBACK_MS,
    useMensagemTemporaria
} from './useMensagemTemporaria.js';

describe('useMensagemTemporaria', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('deve definir mensagem temporaria e limpar apos duracao padrao', () => {
        const { result } = renderHook(() => useMensagemTemporaria());

        act(() => {
            result.current.definirMensagem('Operação concluída.');
        });

        expect(result.current.mensagem).toBe('Operação concluída.');

        act(() => {
            vi.advanceTimersByTime(DURACAO_MENSAGEM_FEEDBACK_MS);
        });

        expect(result.current.mensagem).toBe('');
    });

    it('deve manter mensagem permanente quando temporario for false', () => {
        const { result } = renderHook(() => useMensagemTemporaria(1000));

        act(() => {
            result.current.definirMensagem('Aviso fixo', { temporario: false });
        });

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(result.current.mensagem).toBe('Aviso fixo');
    });

    it('deve limpar mensagem manualmente e cancelar timeout pendente', () => {
        const { result } = renderHook(() => useMensagemTemporaria());

        act(() => {
            result.current.definirMensagem('Mensagem ativa');
        });

        act(() => {
            result.current.limparMensagem();
        });

        expect(result.current.mensagem).toBe('');

        act(() => {
            vi.advanceTimersByTime(DURACAO_MENSAGEM_FEEDBACK_MS);
        });

        expect(result.current.mensagem).toBe('');
    });

    it('deve aceitar mensagem vazia sem agendar timeout', () => {
        const { result } = renderHook(() => useMensagemTemporaria());

        act(() => {
            result.current.definirMensagem('');
        });

        expect(result.current.mensagem).toBe('');

        act(() => {
            vi.advanceTimersByTime(DURACAO_MENSAGEM_FEEDBACK_MS);
        });

        expect(result.current.mensagem).toBe('');
    });

    it('deve limpar timeout ao desmontar', () => {
        const { result, unmount } = renderHook(() => useMensagemTemporaria());

        act(() => {
            result.current.definirMensagem('Mensagem temporaria');
        });

        unmount();

        expect(() => {
            act(() => {
                vi.advanceTimersByTime(DURACAO_MENSAGEM_FEEDBACK_MS);
            });
        }).not.toThrow();
    });
});
