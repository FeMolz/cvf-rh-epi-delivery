import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SeletorVagaCandidaturas } from './SeletorVagaCandidaturas.jsx';

vi.mock('../services/recrutamentoApi.js', () => ({
    listarVagasAdmin: vi.fn()
}));

const { listarVagasAdmin } = await import('../services/recrutamentoApi.js');

describe('SeletorVagaCandidaturas', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve carregar vagas e acionar onChange', async () => {
        const usuario = userEvent.setup({ delay: null });
        const onChange = vi.fn();

        listarVagasAdmin
            .mockResolvedValueOnce([{ id: 'v1', tituloVaga: 'Analista' }])
            .mockResolvedValueOnce([{ id: 'v1', tituloVaga: 'Analista' }])
            .mockResolvedValueOnce([{ id: 'v2', tituloVaga: 'Dev' }]);

        render(<SeletorVagaCandidaturas token="jwt" valor="" onChange={onChange} />);

        await waitFor(() => {
            expect(screen.getByRole('option', { name: /analista/i })).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/filtrar por vaga/i), 'v2');
        expect(onChange).toHaveBeenCalledWith('v2');
    });

    it('deve exibir todas as vagas quando a api falhar', async () => {
        listarVagasAdmin.mockRejectedValue(new Error('falha'));

        render(<SeletorVagaCandidaturas token="jwt" valor="" onChange={vi.fn()} />);

        await waitFor(() => {
            expect(screen.getByRole('option', { name: /todas as vagas/i })).toBeInTheDocument();
        });
    });
});
