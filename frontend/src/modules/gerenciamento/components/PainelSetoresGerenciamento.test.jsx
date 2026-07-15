import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PainelSetoresGerenciamento } from './PainelSetoresGerenciamento.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../setores/services/setoresApi.js', () => ({
    criarSetor: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { criarSetor } = await import('../../setores/services/setoresApi.js');

describe('PainelSetoresGerenciamento', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        criarSetor.mockResolvedValue({ id: 'set-1' });
    });

    it('deve renderizar formulario e cadastrar setor', async () => {
        const usuario = userEvent.setup();

        render(<PainelSetoresGerenciamento />);

        expect(screen.getByRole('heading', { name: 'Setores' })).toBeInTheDocument();

        await usuario.type(screen.getByLabelText(/nome do setor/i), 'RH');
        await usuario.click(screen.getByRole('button', { name: /cadastrar setor/i }));

        await waitFor(() => {
            expect(criarSetor).toHaveBeenCalledWith({ nome: 'RH' }, 'jwt');
        });
    });
});
