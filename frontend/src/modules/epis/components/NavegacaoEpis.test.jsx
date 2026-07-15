import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { NavegacaoEpis } from './NavegacaoEpis.jsx';

function renderizarNavegacao(rotaInicial) {
    return render(
        <MemoryRouter initialEntries={[rotaInicial]}>
            <Routes>
                <Route path="/admin/epis/*" element={<NavegacaoEpis />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('NavegacaoEpis', () => {
    it('deve exibir abas e navegar para vinculos', async () => {
        const usuario = userEvent.setup();

        renderizarNavegacao('/admin/epis');

        expect(screen.getByRole('button', { name: 'Consulta' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Vincular a cargo' })).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: 'Vincular a cargo' }));

        expect(screen.getByRole('button', { name: 'Vincular a cargo' })).toHaveAttribute(
            'aria-current',
            'page'
        );
    });

    it('deve destacar aba vinculos quando pathname incluir vinculos', () => {
        renderizarNavegacao('/admin/epis/vinculos');

        expect(screen.getByRole('button', { name: 'Vincular a cargo' })).toHaveAttribute(
            'aria-current',
            'page'
        );
        expect(screen.getByRole('button', { name: 'Consulta' })).not.toHaveAttribute(
            'aria-current',
            'page'
        );
    });

    it('deve navegar para consulta ao clicar na aba listagem', async () => {
        const usuario = userEvent.setup();

        renderizarNavegacao('/admin/epis/vinculos');

        await usuario.click(screen.getByRole('button', { name: 'Consulta' }));

        expect(screen.getByRole('button', { name: 'Consulta' })).toHaveAttribute(
            'aria-current',
            'page'
        );
    });
});
