import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { CadastroFuncionarioPage } from './CadastroFuncionarioPage.jsx';

describe('CadastroFuncionarioPage', () => {
    it('deve redirecionar para cadastramento na secao funcionarios', () => {
        render(
            <MemoryRouter initialEntries={['/admin/funcionarios/cadastro']}>
                <Routes>
                    <Route path="/admin/funcionarios/cadastro" element={<CadastroFuncionarioPage />} />
                    <Route path="/admin/cadastramento" element={<p>Painel de cadastramento</p>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Painel de cadastramento')).toBeInTheDocument();
    });
});
