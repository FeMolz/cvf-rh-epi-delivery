import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LayoutAdmin } from './LayoutAdmin.jsx';

const logoutMock = vi.fn().mockResolvedValue(undefined);
const navegarMock = vi.fn();

vi.mock('../auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('react-router-dom', async () => {
    const atual = await vi.importActual('react-router-dom');
    return {
        ...atual,
        useNavigate: () => navegarMock
    };
});

const { useAuth } = await import('../auth/useAuth.js');

function renderizarLayout(role = 'ADMIN') {
    useAuth.mockReturnValue({
        user: { id: '1', name: 'Admin Teste', role },
        logout: logoutMock
    });

    return render(
        <MemoryRouter initialEntries={['/admin']}>
            <Routes>
                <Route path="/admin" element={<LayoutAdmin />}>
                    <Route index element={<p>Conteúdo admin</p>} />
                </Route>
                <Route path="/login" element={<p>Login</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('LayoutAdmin', () => {
    it('deve renderizar sidebar, modulos e conteudo', () => {
        renderizarLayout('ADMIN');

        expect(screen.getByLabelText(/navegação principal/i)).toBeInTheDocument();
        expect(screen.getByText('Admin Teste')).toBeInTheDocument();
        expect(screen.getByText('Administrador')).toBeInTheDocument();
        expect(screen.getByText('Conteúdo admin')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /gerenciamento/i })).toBeInTheDocument();
    });

    it('deve exibir modulos de almoxarifado', () => {
        renderizarLayout('ALMOXARIFADO');

        expect(screen.getByRole('link', { name: /entregas de epi/i })).toBeInTheDocument();
        expect(screen.getByText('Almoxarifado')).toBeInTheDocument();
    });

    it('deve sair e navegar para login', async () => {
        const usuario = userEvent.setup();
        logoutMock.mockClear();
        navegarMock.mockClear();

        renderizarLayout();

        await usuario.click(screen.getByRole('button', { name: /sair/i }));

        expect(logoutMock).toHaveBeenCalled();
        expect(navegarMock).toHaveBeenCalledWith('/login');
    });

    it('deve destacar modulo ativo na sidebar', () => {
        useAuth.mockReturnValue({
            user: { id: '1', name: 'Admin Teste', role: 'ADMIN' },
            logout: logoutMock
        });

        render(
            <MemoryRouter initialEntries={['/admin/gerenciamento']}>
                <Routes>
                    <Route path="/admin" element={<LayoutAdmin />}>
                        <Route path="gerenciamento" element={<p>Conteúdo admin</p>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: /gerenciamento/i })).toHaveClass(
            'admin-sidebar__link--ativo'
        );
    });

    it('deve exibir modulos em breve para administrador', () => {
        renderizarLayout('ADMIN');

        expect(screen.getAllByText('Em breve').length).toBeGreaterThan(0);
    });

    it('deve exibir papel desconhecido no rodape', () => {
        useAuth.mockReturnValue({
            user: { id: '1', name: 'Usuario', role: 'PAPEL_CUSTOM' },
            logout: logoutMock
        });

        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route path="/admin" element={<LayoutAdmin />}>
                        <Route index element={<p>Conteúdo admin</p>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('PAPEL_CUSTOM')).toBeInTheDocument();
    });
});
