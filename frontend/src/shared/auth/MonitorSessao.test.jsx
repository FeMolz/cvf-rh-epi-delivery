import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';

import { MonitorSessao } from './MonitorSessao.jsx';
import * as sessaoExpirada from './sessaoExpirada.js';

const encerrarSessaoLocalMock = vi.hoisted(() => vi.fn());
const tokenJwtExpiradoMock = vi.hoisted(() => vi.fn(() => false));
const obterTempoRestanteJwtMock = vi.hoisted(() => vi.fn(() => null));

vi.mock('./useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('./jwtUtils.js', () => ({
    tokenJwtExpirado: tokenJwtExpiradoMock,
    obterTempoRestanteJwt: obterTempoRestanteJwtMock
}));

const { useAuth } = await import('./useAuth.js');

describe('MonitorSessao', () => {
    beforeEach(() => {
        encerrarSessaoLocalMock.mockReset();
        tokenJwtExpiradoMock.mockReset();
        obterTempoRestanteJwtMock.mockReset();
        tokenJwtExpiradoMock.mockReturnValue(false);
        obterTempoRestanteJwtMock.mockReturnValue(null);
        useAuth.mockReturnValue({
            token: 'token-monitor',
            encerrarSessaoLocal: encerrarSessaoLocalMock
        });
        sessaoExpirada.reiniciarNotificacaoSessaoExpirada();
        vi.useRealTimers();
    });

    it('deve redirecionar para login quando a sessão expirar', async () => {
        render(
            <MemoryRouter initialEntries={['/admin']}>
                <MonitorSessao />
                <Routes>
                    <Route path="/admin" element={<p>Área admin</p>} />
                    <Route path="/login" element={<p>Tela de login</p>} />
                </Routes>
            </MemoryRouter>
        );

        sessaoExpirada.notificarSessaoExpirada();

        await waitFor(() => {
            expect(encerrarSessaoLocalMock).toHaveBeenCalledTimes(1);
            expect(screen.getByText('Tela de login')).toBeInTheDocument();
        });
    });

    it('deve notificar expiração quando token já está vencido', () => {
        const notificarSpy = vi.spyOn(sessaoExpirada, 'notificarSessaoExpirada');
        tokenJwtExpiradoMock.mockReturnValue(true);

        render(
            <MemoryRouter>
                <MonitorSessao />
            </MemoryRouter>
        );

        expect(tokenJwtExpiradoMock).toHaveBeenCalledWith('token-monitor');
        expect(notificarSpy).toHaveBeenCalledTimes(1);
    });

    it('não deve agendar timer sem token', () => {
        const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
        useAuth.mockReturnValue({
            token: null,
            encerrarSessaoLocal: encerrarSessaoLocalMock
        });

        render(
            <MemoryRouter>
                <MonitorSessao />
            </MemoryRouter>
        );

        expect(setTimeoutSpy).not.toHaveBeenCalled();
    });

    it('deve agendar notificação com tempo restante do token', () => {
        const notificarSpy = vi.spyOn(sessaoExpirada, 'notificarSessaoExpirada');
        vi.useFakeTimers();
        obterTempoRestanteJwtMock.mockReturnValue(5000);

        render(
            <MemoryRouter>
                <MonitorSessao />
            </MemoryRouter>
        );

        expect(obterTempoRestanteJwtMock).toHaveBeenCalledWith('token-monitor');

        vi.advanceTimersByTime(5000);

        expect(notificarSpy).toHaveBeenCalledTimes(1);
        vi.useRealTimers();
    });

    it('deve limpar timer ao desmontar', () => {
        vi.useFakeTimers();
        const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
        obterTempoRestanteJwtMock.mockReturnValue(10000);

        const { unmount } = render(
            <MemoryRouter>
                <MonitorSessao />
            </MemoryRouter>
        );

        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalled();
        vi.useRealTimers();
    });
});
