import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { STATUS_CANDIDATURA } from '../constants/recrutamentoConstantes.js';
import { SeletorStatusCandidatura } from './SeletorStatusCandidatura.jsx';

describe('SeletorStatusCandidatura', () => {
    it('nao deve renderizar quando status for descartado', () => {
        const { container } = render(
            <SeletorStatusCandidatura
                statusAtual={STATUS_CANDIDATURA.DESCARTADO}
                onAlterarStatus={vi.fn()}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('deve alterar status e ocultar proxima fase quando ja estiver nela', async () => {
        const usuario = userEvent.setup({ delay: null });
        const onAlterarStatus = vi.fn();

        const { rerender } = render(
            <SeletorStatusCandidatura
                statusAtual={STATUS_CANDIDATURA.NOVA}
                onAlterarStatus={onAlterarStatus}
            />
        );

        await usuario.selectOptions(screen.getByRole('combobox'), STATUS_CANDIDATURA.PROXIMA_FASE);
        expect(onAlterarStatus).toHaveBeenCalledWith(STATUS_CANDIDATURA.PROXIMA_FASE);

        rerender(
            <SeletorStatusCandidatura
                statusAtual={STATUS_CANDIDATURA.PROXIMA_FASE}
                onAlterarStatus={onAlterarStatus}
            />
        );

        expect(screen.queryByRole('option', { name: /próxima fase/i })).not.toBeInTheDocument();
    });
});
