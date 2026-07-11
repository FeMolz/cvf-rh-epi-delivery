import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SelecaoEpisSemVinculoCargo } from './SelecaoEpisSemVinculoCargo.jsx';

vi.mock('../../epis/components/PesquisaEpiPorNome.jsx', () => ({
    PesquisaEpiPorNome: ({ onAlternarEpi }) => (
        <button type="button" onClick={() => onAlternarEpi('11111')}>
            Pesquisar EPI
        </button>
    )
}));

const episCache = [
    { id: 'c1', caNumber: '22222', name: 'Capacete', isActive: true },
    { id: 'c2', caNumber: '33333', name: 'Luva Inativa', isActive: false }
];

describe('SelecaoEpisSemVinculoCargo', () => {
    it('deve exibir aviso e cache ativo', () => {
        render(
            <SelecaoEpisSemVinculoCargo
                token="jwt"
                episCache={episCache}
                episSelecionados={[]}
                onAlternarEpi={vi.fn()}
            />
        );

        expect(screen.getByText(/não possui epis vinculados/i)).toBeInTheDocument();
        expect(screen.getByText(/capacete/i)).toBeInTheDocument();
        expect(screen.queryByText(/luva inativa/i)).not.toBeInTheDocument();
    });

    it('deve filtrar cache e alternar selecao', async () => {
        const usuario = userEvent.setup();
        const onAlternarEpi = vi.fn();

        render(
            <SelecaoEpisSemVinculoCargo
                token="jwt"
                episCache={episCache}
                episSelecionados={[]}
                onAlternarEpi={onAlternarEpi}
            />
        );

        await usuario.type(screen.getByPlaceholderText(/filtrar por nome ou ca/i), '99999');
        expect(screen.getByText(/nenhum epi em cache corresponde ao filtro/i)).toBeInTheDocument();

        await usuario.clear(screen.getByPlaceholderText(/filtrar por nome ou ca/i));
        await usuario.click(screen.getAllByRole('checkbox')[0]);
        expect(onAlternarEpi).toHaveBeenCalledWith('22222');

        await usuario.click(screen.getByRole('button', { name: /pesquisar epi/i }));
        expect(onAlternarEpi).toHaveBeenCalledWith('11111');
    });

    it('deve exibir cache vazio e respeitar desabilitado', () => {
        render(
            <SelecaoEpisSemVinculoCargo
                token="jwt"
                episCache={[]}
                episSelecionados={['22222']}
                desabilitado
                onAlternarEpi={vi.fn()}
            />
        );

        expect(screen.getByText(/nenhum epi ativo em cache no momento/i)).toBeInTheDocument();
    });

    it('deve marcar epi selecionado no cache', () => {
        render(
            <SelecaoEpisSemVinculoCargo
                token="jwt"
                episCache={[{ caNumber: '33333', name: 'Óculos', isInactive: false }]}
                episSelecionados={['33333']}
                onAlternarEpi={vi.fn()}
            />
        );

        expect(screen.getByRole('checkbox')).toBeChecked();
    });
});
