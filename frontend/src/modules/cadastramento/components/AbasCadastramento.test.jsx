import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AbasCadastramento } from './AbasCadastramento.jsx';

describe('AbasCadastramento', () => {
    it('deve destacar aba ativa e trocar seção', async () => {
        const usuario = userEvent.setup();
        const onTrocarAba = vi.fn();

        render(
            <AbasCadastramento
                abaAtiva="usuarios"
                abas={[
                    { id: 'usuarios', rotulo: 'Usuários' },
                    { id: 'cargos', rotulo: 'Cargos' }
                ]}
                onTrocarAba={onTrocarAba}
            />
        );

        expect(screen.getByRole('button', { name: 'Usuários' })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('button', { name: 'Cargos' })).not.toHaveAttribute('aria-current');

        await usuario.click(screen.getByRole('button', { name: 'Cargos' }));
        await usuario.click(screen.getByRole('button', { name: 'Usuários' }));

        expect(onTrocarAba).toHaveBeenNthCalledWith(1, 'cargos');
        expect(onTrocarAba).toHaveBeenNthCalledWith(2, 'usuarios');
    });
});
