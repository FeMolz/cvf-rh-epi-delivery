import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FiltrosHistoricoEmissoes } from './FiltrosHistoricoEmissoes.jsx';

const funcionarios = [{ id: 'f1', name: 'Ana Silva', roleName: 'Soldador' }];

describe('FiltrosHistoricoEmissoes', () => {
    it('deve chamar callbacks de filtro e busca', async () => {
        const usuario = userEvent.setup({ delay: null });
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

    it('deve permitir selecionar periodo sem funcionario e habilitar busca com periodo completo', () => {
        const onAlterarEmissaoInicio = vi.fn();

        const { rerender } = render(
            <FiltrosHistoricoEmissoes
                funcionarios={funcionarios}
                employeeId=""
                emissaoInicio=""
                emissaoFim=""
                onAlterarEmployeeId={vi.fn()}
                onAlterarEmissaoInicio={onAlterarEmissaoInicio}
                onAlterarEmissaoFim={vi.fn()}
                onBuscar={vi.fn()}
                onLimpar={vi.fn()}
            />
        );

        const campoInicio = document.getElementById('historico-emissao-inicio');
        expect(campoInicio).not.toBeDisabled();
        expect(screen.getByRole('button', { name: /buscar emissões/i })).toBeDisabled();

        fireEvent.change(campoInicio, { target: { value: '01012026' } });
        expect(onAlterarEmissaoInicio).toHaveBeenCalled();

        rerender(
            <FiltrosHistoricoEmissoes
                funcionarios={funcionarios}
                employeeId=""
                emissaoInicio="2026-01-01"
                emissaoFim="2026-01-31"
                onAlterarEmployeeId={vi.fn()}
                onAlterarEmissaoInicio={onAlterarEmissaoInicio}
                onAlterarEmissaoFim={vi.fn()}
                onBuscar={vi.fn()}
                onLimpar={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: /buscar emissões/i })).not.toBeDisabled();
    });

    it('deve alterar datas pelo calendario e exibir estado buscando', () => {
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

        fireEvent.change(screen.getByLabelText(/abrir calendário para emissão de/i), {
            target: { value: '2026-02-01' }
        });
        fireEvent.change(screen.getByLabelText(/abrir calendário para emissão até/i), {
            target: { value: '2026-02-28' }
        });

        expect(onAlterarEmissaoInicio).toHaveBeenCalledWith('2026-02-01');
        expect(onAlterarEmissaoFim).toHaveBeenCalledWith('2026-02-28');
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
