import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ListaUsuariosCadastrados } from './ListaUsuariosCadastrados.jsx';

vi.mock('../../../shared/components/DialogoConfirmacao.jsx', () => ({
    DialogoConfirmacao: () => null
}));

describe('ListaUsuariosCadastrados', () => {
    it('deve listar usuários com ações', () => {
        render(
            <MemoryRouter>
                <ListaUsuariosCadastrados
                    token="token"
                    totalEmpresas={3}
                    usuarios={[
                        {
                            id: '10',
                            name: 'João Silva',
                            email: 'joao@teste.com',
                            role: 'ADMINISTRATIVO'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText(/Administrativo · 3 empresas/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/admin/usuarios/10');
    });
});
