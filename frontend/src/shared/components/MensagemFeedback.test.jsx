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

    it('deve ocultar aviso temporario e manter aviso fixo', () => {
        const onLimparAviso = vi.fn();

        const { rerender } = render(
            <AreaMensagensFeedback
                aviso="Aviso temporario"
                avisoTemporario
                onLimparAviso={onLimparAviso}
            />
        );

        expect(screen.getByRole('status')).toHaveTextContent('Aviso temporario');

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(onLimparAviso).toHaveBeenCalledTimes(1);

        rerender(
            <AreaMensagensFeedback
                aviso="Aviso fixo"
                avisoTemporario={false}
                onLimparAviso={onLimparAviso}
            />
        );

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(onLimparAviso).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('status')).toHaveTextContent('Aviso fixo');
    });

    it('deve retornar null quando nao houver mensagens', () => {
        const { container } = render(<AreaMensagensFeedback />);

        expect(container).toBeEmptyDOMElement();
    });

    it('deve ignorar callbacks ausentes ao ocultar mensagens', () => {
        render(<AreaMensagensFeedback erro="Falha" sucesso="Ok" aviso="Aviso" avisoTemporario />);

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(screen.getByRole('alert')).toHaveTextContent('Falha');
    });

    it('deve aplicar className customizada', () => {
        const { container } = render(
            <AreaMensagensFeedback erro="Falha" className="feedback-custom" />
        );

        expect(container.firstChild).toHaveClass('feedback-custom');
    });
});
