import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { CadastroUsuarioPage } from './CadastroUsuarioPage.jsx';

describe('CadastroUsuarioPage', () => {
    it('deve redirecionar para o gerenciamento', () => {
        render(
            <MemoryRouter initialEntries={['/admin/usuarios/cadastro']}>
                <Routes>
                    <Route path="/admin/usuarios/cadastro" element={<CadastroUsuarioPage />} />
                    <Route path="/admin/gerenciamento" element={<p>Gerenciamento</p>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Gerenciamento')).toBeInTheDocument();
    });
});
