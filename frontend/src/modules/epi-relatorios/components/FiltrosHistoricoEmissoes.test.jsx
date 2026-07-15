import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FiltrosHistoricoEmissoes } from './FiltrosHistoricoEmissoes.jsx';

const funcionarios = [{ id: 'f1', name: 'Ana Silva', roleName: 'Soldador' }];

describe('FiltrosHistoricoEmissoes', () => {
    it('deve chamar callbacks de filtro e busca', async () => {
        const usuario = userEvent.setup();
        const onAlterarEmployeeId = vi.fn();
        const onAlterarEmissaoInicio = vi.fn();
        const onAlterarEmissaoFim = vi.fn();
        const onBuscar = vi.fn();
        const onLimpar = vi.fn();

        render(
            <FiltrosHistoricoEmissoes
                funcionarios={funcionarios}
                employeeId="f1"
                emissaoInicio="2026-01-01"
                emissaoFim="2026-01-31"
                onAlterarEmployeeId={onAlterarEmployeeId}
                onAlterarEmissaoInicio={onAlterarEmissaoInicio}
                onAlterarEmissaoFim={onAlterarEmissaoFim}
                onBuscar={onBuscar}
                onLimpar={onLimpar}
            />
        );

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.click(screen.getByRole('button', { name: /buscar emissões/i }));
        await usuario.click(screen.getByRole('button', { name: /limpar/i }));

        expect(onAlterarEmployeeId).toHaveBeenCalled();
        expect(onBuscar).toHaveBeenCalled();
        expect(onLimpar).toHaveBeenCalled();
    });

    it('deve desabilitar datas e busca sem funcionario', () => {
        render(
            <FiltrosHistoricoEmissoes
                funcionarios={funcionarios}
                employeeId=""
                emissaoInicio=""
                emissaoFim=""
                onAlterarEmployeeId={vi.fn()}
                onAlterarEmissaoInicio={vi.fn()}
                onAlterarEmissaoFim={vi.fn()}
                onBuscar={vi.fn()}
                onLimpar={vi.fn()}
            />
        );

        expect(screen.getByLabelText(/emissão de/i)).toBeDisabled();
        expect(screen.getByLabelText(/emissão até/i)).toBeDisabled();
        expect(screen.getByRole('button', { name: /buscar emissões/i })).toBeDisabled();
    });

    it('deve alterar datas e exibir estado buscando', () => {
        const onAlterarEmissaoInicio = vi.fn();
        const onAlterarEmissaoFim = vi.fn();

        render(
            <FiltrosHistoricoEmissoes
                funcionarios={[{ id: 'f1', name: 'Ana Silva', roleName: 'Soldador' }]}
                employeeId="f1"
                emissaoInicio="2026-01-01"
                emissaoFim="2026-01-31"
                processando
                onAlterarEmployeeId={vi.fn()}
                onAlterarEmissaoInicio={onAlterarEmissaoInicio}
                onAlterarEmissaoFim={onAlterarEmissaoFim}
                onBuscar={vi.fn()}
                onLimpar={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: /buscando/i })).toBeDisabled();
        expect(screen.getByRole('option', { name: /ana silva — soldador/i })).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/emissão de/i), {
            target: { value: '2026-02-01' }
        });
        fireEvent.change(screen.getByLabelText(/emissão até/i), {
            target: { value: '2026-02-28' }
        });

        expect(onAlterarEmissaoInicio).toHaveBeenCalled();
        expect(onAlterarEmissaoFim).toHaveBeenCalled();
    });

    it('deve listar funcionario sem cargo no rotulo da opcao', () => {
        render(
            <FiltrosHistoricoEmissoes
                funcionarios={[{ id: 'f2', name: 'Bruno' }]}
                employeeId=""
                emissaoInicio=""
                emissaoFim=""
                onAlterarEmployeeId={vi.fn()}
                onAlterarEmissaoInicio={vi.fn()}
                onAlterarEmissaoFim={vi.fn()}
                onBuscar={vi.fn()}
                onLimpar={vi.fn()}
            />
        );

        expect(screen.getByRole('option', { name: 'Bruno' })).toBeInTheDocument();
    });
});
