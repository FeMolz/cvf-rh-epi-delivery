import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TabelaFuncionariosEpi } from './TabelaFuncionariosEpi.jsx';

function criarFuncionario(indice) {
    return {
        id: `f${indice}`,
        name: `Funcionário ${indice}`,
        roleName: 'Soldador',
        resumoEpis: { emDia: indice, vencidos: 0, pendentes: 0 }
    };
}

describe('TabelaFuncionariosEpi', () => {
    it('deve exibir estado vazio', () => {
        render(<TabelaFuncionariosEpi funcionarios={[]} onSelecionar={vi.fn()} />);

        expect(screen.getByText(/nenhum funcionário ativo encontrado/i)).toBeInTheDocument();
    });

    it('deve selecionar funcionario', async () => {
        const usuario = userEvent.setup();
        const onSelecionar = vi.fn();

        render(
            <TabelaFuncionariosEpi
                funcionarios={[criarFuncionario(1)]}
                onSelecionar={onSelecionar}
            />
        );

        await usuario.click(screen.getByRole('button', { name: 'Funcionário 1' }));

        expect(onSelecionar).toHaveBeenCalledWith('f1');
    });

    it('deve paginar funcionarios', async () => {
        const usuario = userEvent.setup();
        const funcionarios = Array.from({ length: 26 }, (_, indice) => criarFuncionario(indice + 1));

        render(<TabelaFuncionariosEpi funcionarios={funcionarios} onSelecionar={vi.fn()} />);

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));

        expect(screen.getByRole('button', { name: 'Funcionário 26' })).toBeInTheDocument();
    });

    it('deve destacar funcionario selecionado e paginar para tras', async () => {
        const usuario = userEvent.setup();
        const funcionarios = Array.from({ length: 26 }, (_, indice) => criarFuncionario(indice + 1));

        const { container } = render(
            <TabelaFuncionariosEpi
                funcionarios={funcionarios}
                funcionarioSelecionadoId="f1"
                onSelecionar={vi.fn()}
            />
        );

        expect(container.querySelector('.entregas-epi__linha--ativa')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        await usuario.click(screen.getByRole('button', { name: /anterior/i }));

        expect(screen.getByRole('button', { name: 'Funcionário 1' })).toBeInTheDocument();
    });

    it('deve exibir traco quando cargo ausente', () => {
        render(
            <TabelaFuncionariosEpi
                funcionarios={[{ id: 'f1', name: 'Ana', resumoEpis: { emDia: 0, vencidos: 0, pendentes: 0 } }]}
                onSelecionar={vi.fn()}
            />
        );

        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('deve tratar funcionario sem resumo de epis', () => {
        render(
            <TabelaFuncionariosEpi
                funcionarios={[{ id: 'f1', name: 'Ana', roleName: 'Soldador' }]}
                onSelecionar={vi.fn()}
            />
        );

        expect(screen.getByText('Ana')).toBeInTheDocument();
    });
});
