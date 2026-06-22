import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AreaMensagensFeedback } from './MensagemFeedback.jsx';

describe('AreaMensagensFeedback', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('deve ocultar mensagem de sucesso após 2 segundos', () => {
        const onLimparSucesso = vi.fn();

        render(
            <AreaMensagensFeedback
                sucesso="Operação concluída."
                onLimparSucesso={onLimparSucesso}
            />
        );

        expect(screen.getByRole('status')).toHaveTextContent('Operação concluída.');

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(onLimparSucesso).toHaveBeenCalledTimes(1);
    });

    it('deve ocultar mensagem de erro após 2 segundos', () => {
        const onLimparErro = vi.fn();

        render(<AreaMensagensFeedback erro="Falha na operação." onLimparErro={onLimparErro} />);

        expect(screen.getByRole('alert')).toHaveTextContent('Falha na operação.');

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(onLimparErro).toHaveBeenCalledTimes(1);
    });
});
