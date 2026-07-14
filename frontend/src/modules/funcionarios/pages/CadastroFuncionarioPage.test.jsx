import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { CadastroFuncionarioPage } from './CadastroFuncionarioPage.jsx';

describe('CadastroFuncionarioPage', () => {
    it('deve redirecionar para gerenciamento na secao funcionarios', () => {
        render(
            <MemoryRouter initialEntries={['/admin/funcionarios/cadastro']}>
                <Routes>
                    <Route path="/admin/funcionarios/cadastro" element={<CadastroFuncionarioPage />} />
                    <Route
                        path="/admin/gerenciamento"
                        element={<p>Painel de gerenciamento</p>}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Painel de gerenciamento')).toBeInTheDocument();
    });
});
