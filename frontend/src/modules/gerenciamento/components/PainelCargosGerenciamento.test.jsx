import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PainelCargosGerenciamento } from './PainelCargosGerenciamento.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../cargos/services/cargosApi.js', () => ({
    criarCargo: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { criarCargo } = await import('../../cargos/services/cargosApi.js');

describe('PainelCargosGerenciamento', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        criarCargo.mockResolvedValue({ id: 'cargo-1' });
    });

    it('deve renderizar formulario e cadastrar cargo', async () => {
        const usuario = userEvent.setup();

        render(<PainelCargosGerenciamento />);

        expect(screen.getByRole('heading', { name: 'Cargos' })).toBeInTheDocument();

        await usuario.type(screen.getByLabelText(/nome do cargo/i), 'Operador');
        await usuario.type(screen.getByLabelText(/descrição/i), 'Linha de produção');
        await usuario.click(screen.getByRole('button', { name: /cadastrar cargo/i }));

        await waitFor(() => {
            expect(criarCargo).toHaveBeenCalledWith(
                { name: 'OPERADOR', description: 'LINHA DE PRODUÇÃO' },
                'jwt'
            );
        });
    });
});
