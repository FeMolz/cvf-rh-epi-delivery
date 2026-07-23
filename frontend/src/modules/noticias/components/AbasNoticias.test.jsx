import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AbasNoticias } from './AbasNoticias.jsx';

describe('AbasNoticias', () => {
    it('deve destacar aba ativa e trocar seção', async () => {
        const usuario = userEvent.setup();
        const onTrocarAba = vi.fn();

        render(
            <AbasNoticias
                abaAtiva="aniversario"
                abas={[
                    { id: 'aniversario', rotulo: 'Aniversário' },
                    { id: 'afastamento', rotulo: 'Afastamento' }
                ]}
                onTrocarAba={onTrocarAba}
            />
        );

        expect(screen.getByRole('button', { name: 'Aniversário' })).toHaveAttribute(
            'aria-current',
            'page'
        );
        expect(screen.getByRole('button', { name: 'Afastamento' })).not.toHaveAttribute(
            'aria-current'
        );

        await usuario.click(screen.getByRole('button', { name: 'Afastamento' }));

        expect(onTrocarAba).toHaveBeenCalledWith('afastamento');
    });
});
