import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AbasModulo } from './AbasModulo.jsx';

describe('AbasModulo', () => {
    it('deve marcar aba ativa e trocar', async () => {
        const usuario = userEvent.setup();
        const onTrocarAba = vi.fn();

        render(
            <AbasModulo
                abaAtiva="a"
                abas={[
                    { id: 'a', rotulo: 'Aba A', icone: <span>icone-a</span> },
                    { id: 'b', rotulo: 'Aba B' }
                ]}
                rotuloAria="Abas de teste"
                onTrocarAba={onTrocarAba}
            />
        );

        const abaAtiva = screen.getByRole('button', { name: /aba a/i });
        expect(abaAtiva).toHaveAttribute('aria-current', 'page');
        expect(screen.getByText('icone-a')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /aba b/i }));

        expect(onTrocarAba).toHaveBeenCalledWith('b');
    });
});
