import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TabelaEpisVencidos } from './TabelaEpisVencidos.jsx';

function criarItem(indice) {
    return {
        employeeId: `e${indice}`,
        employeeName: `Funcionário ${indice}`,
        epiName: 'Capacete',
        caNumber: String(10000 + indice),
        nextDueDate: '2026-01-01'
    };
}

describe('TabelaEpisVencidos', () => {
    it('deve exibir estado vazio', () => {
        render(<TabelaEpisVencidos itens={[]} onEntregarRapido={vi.fn()} />);

        expect(screen.getByText(/nenhum funcionário com epi vencido/i)).toBeInTheDocument();
    });

    it('deve exibir itens e acionar entrega rapida', async () => {
        const usuario = userEvent.setup();
        const onEntregarRapido = vi.fn();
        const itens = [criarItem(1)];

        render(<TabelaEpisVencidos itens={itens} onEntregarRapido={onEntregarRapido} />);

        expect(screen.getByText('Funcionário 1')).toBeInTheDocument();

        await usuario.click(screen.getByTitle(/registrar entrega/i));

        expect(onEntregarRapido).toHaveBeenCalledWith('e1', '10001');
    });

    it('deve exibir paginacao com muitos itens', async () => {
        const usuario = userEvent.setup();
        const itens = Array.from({ length: 26 }, (_, indice) => criarItem(indice + 1));

        render(<TabelaEpisVencidos itens={itens} onEntregarRapido={vi.fn()} />);

        expect(screen.getByText('Funcionário 1')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));

        expect(screen.getByText('Funcionário 26')).toBeInTheDocument();
    });

    it('deve exibir estado processando e paginar para tras', async () => {
        const usuario = userEvent.setup();
        const itens = Array.from({ length: 26 }, (_, indice) => criarItem(indice + 1));

        render(
            <TabelaEpisVencidos
                itens={itens}
                processandoChave="e1-10001"
                onEntregarRapido={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: '…' })).toBeDisabled();

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        await usuario.click(screen.getByRole('button', { name: /anterior/i }));

        expect(screen.getByText('Funcionário 1')).toBeInTheDocument();
    });
});
