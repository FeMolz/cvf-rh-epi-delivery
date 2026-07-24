import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SeletorFiltroStatusCandidatura } from './SeletorFiltroStatusCandidatura.jsx';
import { STATUS_CANDIDATURA } from '../constants/recrutamentoConstantes.js';

describe('SeletorFiltroStatusCandidatura', () => {
    it('deve exibir opcoes de status ativos', () => {
        render(<SeletorFiltroStatusCandidatura valor="" onChange={vi.fn()} />);

        expect(screen.getByLabelText(/filtrar por status/i)).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /todos os status/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /pendente/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /próxima fase/i })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: /descartado/i })).not.toBeInTheDocument();
    });

    it('deve notificar mudanca de status', async () => {
        const usuario = userEvent.setup();
        const onChange = vi.fn();

        render(<SeletorFiltroStatusCandidatura valor="" onChange={onChange} />);

        await usuario.selectOptions(
            screen.getByLabelText(/filtrar por status/i),
            STATUS_CANDIDATURA.PROXIMA_FASE
        );

        expect(onChange).toHaveBeenCalledWith(STATUS_CANDIDATURA.PROXIMA_FASE);
    });
});
