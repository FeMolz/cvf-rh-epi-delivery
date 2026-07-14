import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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

    it('deve limpar valor quando campo for apagado', async () => {
        const usuario = userEvent.setup();
        const onChange = vi.fn();

        render(
            <CampoDataBr
                id="nascimento"
                rotulo="Data de nascimento"
                value="2002-10-10"
                onChange={onChange}
            />
        );

        const campo = screen.getByPlaceholderText('DD/MM/AAAA');
        await usuario.clear(campo);

        expect(onChange).toHaveBeenCalledWith('');
    });

    it('deve normalizar data ao perder foco com valor valido', async () => {
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
        await usuario.tab();

        expect(onChange).toHaveBeenLastCalledWith('2002-10-10');
        expect(campo).toHaveValue('10/10/2002');
    });

    it('deve restaurar valor externo ao perder foco com data invalida', async () => {
        const usuario = userEvent.setup();
        const onChange = vi.fn();

        render(
            <CampoDataBr
                id="nascimento"
                rotulo="Data de nascimento"
                value="2002-10-10"
                onChange={onChange}
            />
        );

        const campo = screen.getByPlaceholderText('DD/MM/AAAA');
        await usuario.clear(campo);
        await usuario.type(campo, '99/99/9999');
        await usuario.tab();

        expect(campo).toHaveValue('10/10/2002');
    });

    it('deve limpar campo ao perder foco vazio', async () => {
        const usuario = userEvent.setup();
        const onChange = vi.fn();

        render(
            <CampoDataBr
                id="nascimento"
                rotulo="Data de nascimento"
                value="2002-10-10"
                onChange={onChange}
            />
        );

        const campo = screen.getByPlaceholderText('DD/MM/AAAA');
        await usuario.clear(campo);
        await usuario.tab();

        expect(onChange).toHaveBeenCalledWith('');
        expect(campo).toHaveValue('');
    });

    it('deve selecionar data pelo calendario nativo', () => {
        const onChange = vi.fn();

        render(
            <CampoDataBr
                id="nascimento"
                rotulo="Data de nascimento"
                value=""
                onChange={onChange}
            />
        );

        const calendario = screen.getByLabelText(/abrir calendário para data de nascimento/i);
        fireEvent.change(calendario, { target: { value: '2002-10-10' } });

        expect(onChange).toHaveBeenCalledWith('2002-10-10');
        expect(screen.getByPlaceholderText('DD/MM/AAAA')).toHaveValue('10/10/2002');
    });

    it('deve sincronizar texto quando valor externo mudar sem edicao', () => {
        const { rerender } = render(
            <CampoDataBr
                id="nascimento"
                rotulo="Data de nascimento"
                value="2002-10-10"
                onChange={vi.fn()}
            />
        );

        rerender(
            <CampoDataBr
                id="nascimento"
                rotulo="Data de nascimento"
                value="2003-11-11"
                onChange={vi.fn()}
            />
        );

        expect(screen.getByPlaceholderText('DD/MM/AAAA')).toHaveValue('11/11/2003');
    });
});
