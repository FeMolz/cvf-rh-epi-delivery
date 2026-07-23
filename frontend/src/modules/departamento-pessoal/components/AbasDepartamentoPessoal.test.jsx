import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AbasDepartamentoPessoal } from './AbasDepartamentoPessoal.jsx';

describe('AbasDepartamentoPessoal', () => {
    it('deve destacar aba ativa e trocar seção', async () => {
        const usuario = userEvent.setup();
        const onTrocarAba = vi.fn();

        render(
            <AbasDepartamentoPessoal
                abaAtiva="funcionarios"
                abas={[
                    { id: 'funcionarios', rotulo: 'Funcionários' },
                    { id: 'ferias', rotulo: 'Férias' }
                ]}
                onTrocarAba={onTrocarAba}
            />
        );

        expect(screen.getByRole('button', { name: 'Funcionários' })).toHaveAttribute(
            'aria-current',
            'page'
        );

        await usuario.click(screen.getByRole('button', { name: 'Férias' }));

        expect(onTrocarAba).toHaveBeenCalledWith('ferias');
    });
});
