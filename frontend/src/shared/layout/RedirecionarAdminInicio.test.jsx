import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { RedirecionarAdminInicio } from './RedirecionarAdminInicio.jsx';

vi.mock('../auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

const { useAuth } = await import('../auth/useAuth.js');

function renderizarComPapel(role) {
    useAuth.mockReturnValue({ user: { role } });

    return render(
        <MemoryRouter initialEntries={['/admin']}>
            <Routes>
                <Route path="/admin" element={<RedirecionarAdminInicio />} />
                <Route path="/admin/epis/entregas" element={<p>Entregas EPI</p>} />
                <Route path="/admin/gerenciamento" element={<p>Gerenciamento</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('RedirecionarAdminInicio', () => {
    it('deve redirecionar almoxarifado para entregas', () => {
        renderizarComPapel('ALMOXARIFADO');
        expect(screen.getByText('Entregas EPI')).toBeInTheDocument();
    });

    it('deve redirecionar demais papeis para gerenciamento', () => {
        renderizarComPapel('ADMIN');
        expect(screen.getByText('Gerenciamento')).toBeInTheDocument();
    });
});
