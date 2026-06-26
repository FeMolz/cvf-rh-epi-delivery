import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';

import { MonitorSessao } from './MonitorSessao.jsx';
import { reiniciarNotificacaoSessaoExpirada } from './sessaoExpirada.js';

const encerrarSessaoLocalMock = vi.fn();

vi.mock('./useAuth.js', () => ({
    useAuth: () => ({
        token: 'token-monitor',
        encerrarSessaoLocal: encerrarSessaoLocalMock
    })
}));

vi.mock('./jwtUtils.js', () => ({
    tokenJwtExpirado: vi.fn(() => false),
    obterTempoRestanteJwt: vi.fn(() => null)
}));

const { notificarSessaoExpirada } = await import('./sessaoExpirada.js');

describe('MonitorSessao', () => {
    beforeEach(() => {
        encerrarSessaoLocalMock.mockReset();
        reiniciarNotificacaoSessaoExpirada();
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

        notificarSessaoExpirada();

        await waitFor(() => {
            expect(encerrarSessaoLocalMock).toHaveBeenCalledTimes(1);
            expect(screen.getByText('Tela de login')).toBeInTheDocument();
        });
    });
});
