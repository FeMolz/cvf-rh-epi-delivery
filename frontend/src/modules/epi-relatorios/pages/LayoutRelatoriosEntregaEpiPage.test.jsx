import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { LayoutRelatoriosEntregaEpiPage } from './LayoutRelatoriosEntregaEpiPage.jsx';

vi.mock('../components/NavegacaoRelatoriosEpi.jsx', () => ({
    NavegacaoRelatoriosEpi: () => <nav data-testid="navegacao-relatorios">Navegação</nav>
}));

describe('LayoutRelatoriosEntregaEpiPage', () => {
    it('deve renderizar cabecalho, navegacao e outlet', () => {
        render(
            <MemoryRouter initialEntries={['/admin/epis/relatorios']}>
                <Routes>
                    <Route path="/admin/epis/relatorios" element={<LayoutRelatoriosEntregaEpiPage />}>
                        <Route index element={<p>Conteúdo filho</p>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /relatórios de entrega de epi/i })).toBeInTheDocument();
        expect(screen.getByTestId('navegacao-relatorios')).toBeInTheDocument();
        expect(screen.getByText('Conteúdo filho')).toBeInTheDocument();
    });
});
