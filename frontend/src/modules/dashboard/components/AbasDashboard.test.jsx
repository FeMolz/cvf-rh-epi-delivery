import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AbasDashboard } from './AbasDashboard.jsx';

describe('AbasDashboard', () => {
    it('deve trocar de aba', async () => {
        const usuario = userEvent.setup();
        const onTrocarAba = vi.fn();

        render(
            <AbasDashboard
                abaAtiva="usuarios"
                abas={[
                    { id: 'usuarios', rotulo: 'Usuários' },
                    { id: 'cargos', rotulo: 'Cargos' }
                ]}
                onTrocarAba={onTrocarAba}
            />
        );

        await usuario.click(screen.getByRole('button', { name: 'Cargos' }));

        expect(onTrocarAba).toHaveBeenCalledWith('cargos');
    });
});
