import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormularioEntregaEpi } from './FormularioEntregaEpi.jsx';

const funcionarios = [{ id: 'f1', name: 'Ana Silva', roleName: 'Soldador' }];
const epis = [{ epiId: 'e1', caNumber: '12345', name: 'Capacete' }];

describe('FormularioEntregaEpi', () => {
    it('deve exibir ajuda sem funcionario selecionado', () => {
        render(
            <FormularioEntregaEpi
                funcionarios={funcionarios}
                epis={[]}
                funcionarioSelecionadoId=""
                episSelecionados={[]}
                dataEntrega="2026-01-15"
                onSelecionarFuncionario={vi.fn()}
                onAlterarDataEntrega={vi.fn()}
                onAlternarEpi={vi.fn()}
                onEntregar={vi.fn()}
            />
        );

        expect(screen.getByText(/selecione um funcionário para escolher os epis/i)).toBeInTheDocument();
    });

    it('deve listar epis vinculados ao cargo e entregar', async () => {
        const usuario = userEvent.setup();
        const onAlternarEpi = vi.fn();
        const onEntregar = vi.fn();

        render(
            <FormularioEntregaEpi
                funcionarios={funcionarios}
                epis={epis}
                funcionarioSelecionadoId="f1"
                episSelecionados={['12345']}
                dataEntrega="2026-01-15"
                onSelecionarFuncionario={vi.fn()}
                onAlterarDataEntrega={vi.fn()}
                onAlternarEpi={onAlternarEpi}
                onEntregar={onEntregar}
            />
        );

        expect(screen.getByText(/capacete/i)).toBeInTheDocument();

        await usuario.click(screen.getByRole('checkbox'));
        expect(onAlternarEpi).toHaveBeenCalledWith('12345');

        await usuario.click(screen.getByRole('button', { name: /entregar/i }));
        expect(onEntregar).toHaveBeenCalled();
    });

    it('deve usar selecao sem vinculo quando nao ha epis', () => {
        render(
            <FormularioEntregaEpi
                token="jwt"
                funcionarios={funcionarios}
                epis={[]}
                episCache={[{ id: 'c1', caNumber: '99999', name: 'Luva', isInactive: false }]}
                funcionarioSelecionadoId="f1"
                episSelecionados={[]}
                dataEntrega="2026-01-15"
                onSelecionarFuncionario={vi.fn()}
                onAlterarDataEntrega={vi.fn()}
                onAlternarEpi={vi.fn()}
                onEntregar={vi.fn()}
            />
        );

        expect(screen.getByText(/não possui epis vinculados/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /epis em cache/i })).toBeInTheDocument();
    });

    it('deve selecionar funcionario, alterar data e desabilitar entrega', async () => {
        const usuario = userEvent.setup();
        const onSelecionarFuncionario = vi.fn();
        const onAlterarDataEntrega = vi.fn();

        const { rerender } = render(
            <FormularioEntregaEpi
                funcionarios={funcionarios}
                epis={epis}
                funcionarioSelecionadoId=""
                episSelecionados={[]}
                dataEntrega=""
                onSelecionarFuncionario={onSelecionarFuncionario}
                onAlterarDataEntrega={onAlterarDataEntrega}
                onAlternarEpi={vi.fn()}
                onEntregar={vi.fn()}
            />
        );

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        expect(onSelecionarFuncionario).toHaveBeenCalledWith('f1');
        expect(screen.getByRole('option', { name: /ana silva — soldador/i })).toBeInTheDocument();

        rerender(
            <FormularioEntregaEpi
                funcionarios={funcionarios}
                epis={epis}
                funcionarioSelecionadoId="f1"
                episSelecionados={[]}
                dataEntrega=""
                onSelecionarFuncionario={onSelecionarFuncionario}
                onAlterarDataEntrega={onAlterarDataEntrega}
                onAlternarEpi={vi.fn()}
                onEntregar={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: /entregar/i })).toBeDisabled();

        await usuario.type(screen.getByLabelText(/data da entrega/i), '2026-01-15');
        expect(onAlterarDataEntrega).toHaveBeenCalled();
    });

    it('deve exibir rotulo entregando quando carregando', () => {
        render(
            <FormularioEntregaEpi
                funcionarios={funcionarios}
                epis={epis}
                funcionarioSelecionadoId="f1"
                episSelecionados={['12345']}
                dataEntrega="2026-01-15"
                carregando
                onSelecionarFuncionario={vi.fn()}
                onAlterarDataEntrega={vi.fn()}
                onAlternarEpi={vi.fn()}
                onEntregar={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: /entregando/i })).toBeDisabled();
        expect(screen.getByText(/epis para entregar — ana silva/i)).toBeInTheDocument();
    });

    it('deve listar funcionario sem cargo no rotulo da opcao', () => {
        render(
            <FormularioEntregaEpi
                funcionarios={[{ id: 'f2', name: 'Bruno' }]}
                epis={epis}
                funcionarioSelecionadoId=""
                episSelecionados={[]}
                dataEntrega=""
                onSelecionarFuncionario={vi.fn()}
                onAlterarDataEntrega={vi.fn()}
                onAlternarEpi={vi.fn()}
                onEntregar={vi.fn()}
            />
        );

        expect(screen.getByRole('option', { name: 'Bruno' })).toBeInTheDocument();
    });

    it('deve exibir legenda sem nome quando funcionario nao for encontrado', () => {
        render(
            <FormularioEntregaEpi
                funcionarios={funcionarios}
                epis={epis}
                funcionarioSelecionadoId="inexistente"
                episSelecionados={[]}
                dataEntrega="2026-01-15"
                onSelecionarFuncionario={vi.fn()}
                onAlterarDataEntrega={vi.fn()}
                onAlternarEpi={vi.fn()}
                onEntregar={vi.fn()}
            />
        );

        expect(screen.getByText(/^epis para entregar$/i)).toBeInTheDocument();
    });
});
