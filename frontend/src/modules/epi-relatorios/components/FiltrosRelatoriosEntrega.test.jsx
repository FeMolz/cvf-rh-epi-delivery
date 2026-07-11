import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FiltrosRelatoriosEntrega } from './FiltrosRelatoriosEntrega.jsx';

const funcionarios = [{ id: 'f1', name: 'Ana Silva' }];

describe('FiltrosRelatoriosEntrega', () => {
    it('deve chamar callbacks ao filtrar e limpar', async () => {
        const usuario = userEvent.setup();
        const onAlterarEmployeeId = vi.fn();
        const onAlterarSituacaoAssinatura = vi.fn();
        const onLimpar = vi.fn();

        render(
            <FiltrosRelatoriosEntrega
                funcionarios={funcionarios}
                employeeId=""
                situacaoAssinatura=""
                onAlterarEmployeeId={onAlterarEmployeeId}
                onAlterarSituacaoAssinatura={onAlterarSituacaoAssinatura}
                onLimpar={onLimpar}
            />
        );

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.selectOptions(screen.getByLabelText(/situação/i), 'false');
        await usuario.click(screen.getByRole('button', { name: /limpar filtros/i }));

        expect(onAlterarEmployeeId).toHaveBeenCalledWith('f1');
        expect(onAlterarSituacaoAssinatura).toHaveBeenCalledWith('false');
        expect(onLimpar).toHaveBeenCalled();
    });
});
