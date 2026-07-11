import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NavegacaoRelatoriosEpi } from './NavegacaoRelatoriosEpi.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');

function renderizarNavegacao(rotaInicial) {
    return render(
        <MemoryRouter initialEntries={[rotaInicial]}>
            <Routes>
                <Route path="/admin/epis/relatorios/*" element={<NavegacaoRelatoriosEpi />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('NavegacaoRelatoriosEpi', () => {
    it('deve exibir abas visiveis para ADMIN e navegar', async () => {
        const usuario = userEvent.setup();
        useAuth.mockReturnValue({ user: { role: 'ADMIN' } });

        renderizarNavegacao('/admin/epis/relatorios/ultimas');

        expect(screen.getByRole('button', { name: /emitir relatório/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /últimas emissões/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /histórico de emissões/i })).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /histórico de emissões/i }));

        expect(screen.getByRole('button', { name: /histórico de emissões/i })).toHaveAttribute(
            'aria-current',
            'page'
        );
    });

    it('deve ocultar aba emitir para ALMOXARIFADO', () => {
        useAuth.mockReturnValue({ user: { role: 'ALMOXARIFADO' } });

        renderizarNavegacao('/admin/epis/relatorios/ultimas');

        expect(screen.queryByRole('button', { name: /emitir relatório/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /últimas emissões/i })).toBeInTheDocument();
    });

    it('deve destacar aba historico e navegar para emitir', async () => {
        const usuario = userEvent.setup();
        useAuth.mockReturnValue({ user: { role: 'ADMIN' } });

        renderizarNavegacao('/admin/epis/relatorios/historico');

        expect(screen.getByRole('button', { name: /histórico de emissões/i })).toHaveAttribute(
            'aria-current',
            'page'
        );

        await usuario.click(screen.getByRole('button', { name: /emitir relatório/i }));

        expect(screen.getByRole('button', { name: /emitir relatório/i })).toHaveAttribute(
            'aria-current',
            'page'
        );
    });
});
