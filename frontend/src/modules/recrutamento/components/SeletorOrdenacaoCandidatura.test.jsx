import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ORDENACAO_CANDIDATURAS } from '../constants/recrutamentoConstantes.js';
import { SeletorOrdenacaoCandidatura } from './SeletorOrdenacaoCandidatura.jsx';

describe('SeletorOrdenacaoCandidatura', () => {
    it('deve alterar ordenacao', async () => {
        const usuario = userEvent.setup({ delay: null });
        const onChange = vi.fn();

        render(
            <SeletorOrdenacaoCandidatura
                valor={ORDENACAO_CANDIDATURAS.RECENTES}
                onChange={onChange}
            />
        );

        await usuario.selectOptions(screen.getByLabelText(/ordenar por/i), ORDENACAO_CANDIDATURAS.ANTIGOS);

        expect(onChange).toHaveBeenCalledWith(ORDENACAO_CANDIDATURAS.ANTIGOS);
    });
});
