import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PainelEmpresasGerenciamento } from './PainelEmpresasGerenciamento.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../empresas/services/empresasApi.js', () => ({
    criarEmpresa: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { criarEmpresa } = await import('../../empresas/services/empresasApi.js');

describe('PainelEmpresasGerenciamento', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        criarEmpresa.mockResolvedValue({ id: 'emp-1' });
    });

    it('deve renderizar formulario e cadastrar empresa', async () => {
        const usuario = userEvent.setup();

        render(<PainelEmpresasGerenciamento />);

        expect(screen.getByRole('heading', { name: 'Empresas' })).toBeInTheDocument();

        await usuario.type(screen.getByLabelText(/nome da empresa/i), 'Empresa A');
        await usuario.type(screen.getByLabelText(/cnpj/i), '11.111.111/0001-11');
        await usuario.click(screen.getByRole('button', { name: /cadastrar empresa/i }));

        await waitFor(() => {
            expect(criarEmpresa).toHaveBeenCalledWith(
                { name: 'EMPRESA A', cnpj: '11.111.111/0001-11' },
                'jwt'
            );
        });
    });
});
