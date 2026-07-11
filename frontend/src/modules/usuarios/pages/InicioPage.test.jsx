import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { InicioPage } from './InicioPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');

function renderizarInicio(rotaInicial = '/') {
    return render(
        <MemoryRouter initialEntries={[rotaInicial]}>
            <Routes>
                <Route path="/" element={<InicioPage />} />
                <Route path="/admin/epis/entregas" element={<p>Entregas EPI</p>} />
                <Route path="/admin/gerenciamento" element={<p>Gerenciamento</p>} />
                <Route path="/login" element={<p>Login</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('InicioPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve exibir convite para login quando visitante', () => {
        useAuth.mockReturnValue({ user: null, autenticado: false });

        renderizarInicio();

        expect(screen.getByRole('heading', { name: /bem-vindo ao cvf gerenciamento/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /ir para login/i })).toHaveAttribute('href', '/login');
    });

    it('deve redirecionar almoxarifado para entregas de EPI', () => {
        useAuth.mockReturnValue({
            user: { name: 'Almox', role: 'ALMOXARIFADO' },
            autenticado: true
        });

        renderizarInicio();

        expect(screen.getByText('Entregas EPI')).toBeInTheDocument();
    });

    it('deve redirecionar perfis de gestão para gerenciamento', () => {
        useAuth.mockReturnValue({
            user: { name: 'Admin', role: 'ADMIN' },
            autenticado: true
        });

        renderizarInicio();

        expect(screen.getByText('Gerenciamento')).toBeInTheDocument();
    });

    it('deve exibir mensagem para colaborador autenticado sem módulos', () => {
        useAuth.mockReturnValue({
            user: { name: 'Carlos', role: 'COLABORADOR' },
            autenticado: true
        });

        renderizarInicio();

        expect(screen.getByRole('heading', { name: /olá, carlos/i })).toBeInTheDocument();
        expect(screen.getByText(/você está autenticado como colaborador/i)).toBeInTheDocument();
        expect(
            screen.getByText(/seu perfil ainda não possui módulos disponíveis no sistema/i)
        ).toBeInTheDocument();
    });

    it('deve exibir papel desconhecido quando rotulo nao estiver mapeado', () => {
        useAuth.mockReturnValue({
            user: { name: 'Visitante', role: 'PAPEL_CUSTOM' },
            autenticado: true
        });

        renderizarInicio();

        expect(screen.getByText(/você está autenticado como papel_custom/i)).toBeInTheDocument();
    });
});
