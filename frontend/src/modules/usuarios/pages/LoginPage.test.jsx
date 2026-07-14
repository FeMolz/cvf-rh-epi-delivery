import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginPage } from './LoginPage.jsx';

const loginMock = vi.fn();

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');

function renderizarLogin(rotaInicial = '/login', state) {
    return render(
        <MemoryRouter initialEntries={[{ pathname: rotaInicial, state }]}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<p>Início</p>} />
                <Route path="/admin/epis/entregas" element={<p>Entregas EPI</p>} />
                <Route path="/admin/gerenciamento" element={<p>Gerenciamento</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            login: loginMock,
            carregando: false,
            autenticado: false
        });
    });

    it('deve redirecionar usuário já autenticado para o início', () => {
        useAuth.mockReturnValue({
            login: loginMock,
            carregando: false,
            autenticado: true
        });

        renderizarLogin();

        expect(screen.getByText('Início')).toBeInTheDocument();
    });

    it('deve exibir aviso de sessão expirada', () => {
        renderizarLogin('/login', { sessaoExpirada: true });

        expect(screen.getByRole('status')).toHaveTextContent(
            'Sua sessão expirou. Faça login novamente para continuar.'
        );
    });

    it('deve navegar para entregas após login de almoxarifado', async () => {
        const usuario = userEvent.setup();
        loginMock.mockResolvedValue({ role: 'ALMOXARIFADO' });

        renderizarLogin();

        await usuario.type(screen.getByLabelText(/e-mail corporativo/i), 'almox@teste.com');
        await usuario.type(screen.getByLabelText(/^senha$/i), 'senha1234');
        await usuario.click(screen.getByRole('button', { name: /entrar/i }));

        await waitFor(() => {
            expect(screen.getByText('Entregas EPI')).toBeInTheDocument();
        });

        expect(loginMock).toHaveBeenCalledWith('almox@teste.com', 'senha1234');
    });

    it('deve navegar para gerenciamento após login administrativo', async () => {
        const usuario = userEvent.setup();
        loginMock.mockResolvedValue({ role: 'ADMINISTRATIVO' });

        renderizarLogin();

        await usuario.type(screen.getByLabelText(/e-mail corporativo/i), 'admin@teste.com');
        await usuario.type(screen.getByLabelText(/^senha$/i), 'senha1234');
        await usuario.click(screen.getByRole('button', { name: /entrar/i }));

        await waitFor(() => {
            expect(screen.getByText('Gerenciamento')).toBeInTheDocument();
        });
    });

    it('deve navegar para início após login de colaborador', async () => {
        const usuario = userEvent.setup();
        loginMock.mockResolvedValue({ role: 'COLABORADOR' });

        renderizarLogin();

        await usuario.type(screen.getByLabelText(/e-mail corporativo/i), 'colab@teste.com');
        await usuario.type(screen.getByLabelText(/^senha$/i), 'senha1234');
        await usuario.click(screen.getByRole('button', { name: /entrar/i }));

        await waitFor(() => {
            expect(screen.getByText('Início')).toBeInTheDocument();
        });
    });

    it('deve exibir link para voltar ao início', () => {
        renderizarLogin();

        expect(screen.getByRole('link', { name: /voltar ao início/i })).toHaveAttribute('href', '/');
    });
});
