import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { RedirecionarRelatoriosEpiInicio } from './RedirecionarRelatoriosEpiInicio.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');

function renderizarComPapel(role) {
    useAuth.mockReturnValue({ user: { role } });

    return render(
        <MemoryRouter initialEntries={['/admin/epis/relatorios']}>
            <Routes>
                <Route path="/admin/epis/relatorios" element={<RedirecionarRelatoriosEpiInicio />} />
                <Route path="/admin/epis/relatorios/emitir" element={<p>Página emitir</p>} />
                <Route path="/admin/epis/relatorios/ultimas" element={<p>Página últimas</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('RedirecionarRelatoriosEpiInicio', () => {
    it('deve redirecionar ADMIN para emitir', () => {
        renderizarComPapel('ADMIN');
        expect(screen.getByText('Página emitir')).toBeInTheDocument();
    });

    it('deve redirecionar ALMOXARIFADO para ultimas', () => {
        renderizarComPapel('ALMOXARIFADO');
        expect(screen.getByText('Página últimas')).toBeInTheDocument();
    });
});
