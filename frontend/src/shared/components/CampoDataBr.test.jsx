import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CampoDataBr } from './CampoDataBr.jsx';

describe('CampoDataBr', () => {
    it('deve formatar data digitada e notificar valor iso', async () => {
        const usuario = userEvent.setup();
        const onChange = vi.fn();

        render(
            <CampoDataBr
                id="nascimento"
                rotulo="Data de nascimento"
                value=""
                onChange={onChange}
            />
        );

        const campo = screen.getByPlaceholderText('DD/MM/AAAA');
        await usuario.type(campo, '10102002');

        expect(campo).toHaveValue('10/10/2002');
        expect(onChange).toHaveBeenLastCalledWith('2002-10-10');
    });

    it('deve exibir icone de calendario dentro do campo', () => {
        const { container } = render(
            <CampoDataBr
                id="nascimento"
                rotulo="Data de nascimento"
                value=""
                onChange={vi.fn()}
            />
        );

        expect(container.querySelector('.campo-data-br__icone-calendario')).toBeInTheDocument();
        expect(container.querySelector('.campo-data-br__input-calendario')).toBeInTheDocument();
    });
});
