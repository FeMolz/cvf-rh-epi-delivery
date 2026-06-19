import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AbasGerenciamento } from './AbasGerenciamento.jsx';

describe('AbasGerenciamento', () => {
    it('deve trocar de aba', async () => {
        const usuario = userEvent.setup();
        const onTrocarAba = vi.fn();

        render(
            <AbasGerenciamento
                abaAtiva="usuarios"
                abas={[
                    { id: 'usuarios', rotulo: 'Usuários' },
                    { id: 'plataforma', rotulo: 'Plataforma' }
                ]}
                onTrocarAba={onTrocarAba}
            />
        );

        await usuario.click(screen.getByRole('button', { name: 'Plataforma' }));

        expect(onTrocarAba).toHaveBeenCalledWith('plataforma');
    });
});
