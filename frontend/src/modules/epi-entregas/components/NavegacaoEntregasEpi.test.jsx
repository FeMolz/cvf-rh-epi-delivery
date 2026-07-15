import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NavegacaoEntregasEpi } from './NavegacaoEntregasEpi.jsx';

function renderizarNavegacao(rotaInicial) {
    return render(
        <MemoryRouter initialEntries={[rotaInicial]}>
            <Routes>
                <Route path="/admin/epis/entregas/*" element={<NavegacaoEntregasEpi />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('NavegacaoEntregasEpi', () => {
    it('deve exibir abas e navegar para entrega imediata', async () => {
        const usuario = userEvent.setup();

        renderizarNavegacao('/admin/epis/entregas');

        expect(screen.getByRole('button', { name: /registro de entrega/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /entrega imediata/i })).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /entrega imediata/i }));

        expect(screen.getByRole('button', { name: /entrega imediata/i })).toHaveAttribute(
            'aria-current',
            'page'
        );
    });

    it('deve destacar aba imediata quando pathname incluir imediata', () => {
        renderizarNavegacao('/admin/epis/entregas/imediata');

        expect(screen.getByRole('button', { name: /entrega imediata/i })).toHaveAttribute(
            'aria-current',
            'page'
        );
    });

    it('deve navegar para registro ao clicar na aba registro', async () => {
        const usuario = userEvent.setup();

        renderizarNavegacao('/admin/epis/entregas/imediata');

        await usuario.click(screen.getByRole('button', { name: /registro de entrega/i }));

        expect(screen.getByRole('button', { name: /registro de entrega/i })).toHaveAttribute(
            'aria-current',
            'page'
        );
    });
});
