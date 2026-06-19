import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AuthProvider } from './AuthContext.jsx';
import { RotasProtegidas } from './RotasProtegidas.jsx';

function renderizarComSessao(usuario) {
    if (usuario) {
        localStorage.setItem('rh_system_token', 'token-teste');
        localStorage.setItem('rh_system_user', JSON.stringify(usuario));
    } else {
        localStorage.clear();
    }

    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={['/privado']}>
                <Routes>
                    <Route element={<RotasProtegidas papeisPermitidos={['ADMIN']} />}>
                        <Route path="/privado" element={<p>Área restrita</p>} />
                    </Route>
                    <Route path="/login" element={<p>Tela de login</p>} />
                    <Route path="/" element={<p>Início</p>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );
}

describe('RotasProtegidas', () => {
    it('deve redirecionar visitante para login', () => {
        renderizarComSessao(null);
        expect(screen.getByText('Tela de login')).toBeInTheDocument();
    });

    it('deve bloquear papel sem permissão', () => {
        renderizarComSessao({ id: '1', role: 'COLABORADOR', name: 'Teste', email: 'a@b.com' });
        expect(screen.getByText('Início')).toBeInTheDocument();
    });

    it('deve permitir acesso com papel autorizado', () => {
        renderizarComSessao({ id: '1', role: 'ADMIN', name: 'Admin', email: 'a@b.com' });
        expect(screen.getByText('Área restrita')).toBeInTheDocument();
    });
});
