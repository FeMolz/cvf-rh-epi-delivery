import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
    FormularioEmitirRelatorio,
    usuarioPodeGerenciarRelatoriosEpi
} from './FormularioEmitirRelatorio.jsx';

const funcionarios = [{ id: 'f1', name: 'Ana Silva', roleName: 'Soldador' }];

describe('FormularioEmitirRelatorio', () => {
    it('nao deve renderizar quando podeEmitir for falso', () => {
        const { container } = render(
            <FormularioEmitirRelatorio
                funcionarios={funcionarios}
                funcionarioId=""
                periodoInicio=""
                periodoFim=""
                podeEmitir={false}
                onAlterarFuncionario={vi.fn()}
                onAlterarPeriodoInicio={vi.fn()}
                onAlterarPeriodoFim={vi.fn()}
                onEmitir={vi.fn()}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('deve chamar callbacks ao alterar campos e emitir', async () => {
        const usuario = userEvent.setup();
        const onAlterarFuncionario = vi.fn();
        const onAlterarPeriodoInicio = vi.fn();
        const onAlterarPeriodoFim = vi.fn();
        const onEmitir = vi.fn();

        render(
            <FormularioEmitirRelatorio
                funcionarios={funcionarios}
                funcionarioId="f1"
                periodoInicio="2026-01-01"
                periodoFim="2026-01-31"
                onAlterarFuncionario={onAlterarFuncionario}
                onAlterarPeriodoInicio={onAlterarPeriodoInicio}
                onAlterarPeriodoFim={onAlterarPeriodoFim}
                onEmitir={onEmitir}
            />
        );

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.clear(screen.getByLabelText(/período início/i));
        await usuario.type(screen.getByLabelText(/período início/i), '2026-02-01');
        await usuario.clear(screen.getByLabelText(/período fim/i));
        await usuario.type(screen.getByLabelText(/período fim/i), '2026-02-28');
        await usuario.click(screen.getByRole('button', { name: /gerar relatório/i }));

        expect(onAlterarFuncionario).toHaveBeenCalled();
        expect(onAlterarPeriodoInicio).toHaveBeenCalled();
        expect(onAlterarPeriodoFim).toHaveBeenCalled();
        expect(onEmitir).toHaveBeenCalled();
    });

    it('deve desabilitar emitir sem campos obrigatorios', () => {
        render(
            <FormularioEmitirRelatorio
                funcionarios={funcionarios}
                funcionarioId=""
                periodoInicio=""
                periodoFim=""
                onAlterarFuncionario={vi.fn()}
                onAlterarPeriodoInicio={vi.fn()}
                onAlterarPeriodoFim={vi.fn()}
                onEmitir={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: /gerar relatório/i })).toBeDisabled();
    });

    it('deve exibir estado processando', () => {
        render(
            <FormularioEmitirRelatorio
                funcionarios={funcionarios}
                funcionarioId="f1"
                periodoInicio="2026-01-01"
                periodoFim="2026-01-31"
                processando
                onAlterarFuncionario={vi.fn()}
                onAlterarPeriodoInicio={vi.fn()}
                onAlterarPeriodoFim={vi.fn()}
                onEmitir={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: /gerando/i })).toBeDisabled();
    });

    it('deve exibir cargo no rotulo da opcao de funcionario', () => {
        render(
            <FormularioEmitirRelatorio
                funcionarios={funcionarios}
                funcionarioId=""
                periodoInicio=""
                periodoFim=""
                onAlterarFuncionario={vi.fn()}
                onAlterarPeriodoInicio={vi.fn()}
                onAlterarPeriodoFim={vi.fn()}
                onEmitir={vi.fn()}
            />
        );

        expect(screen.getByRole('option', { name: /ana silva — soldador/i })).toBeInTheDocument();
    });

    it('deve retornar null quando usuario nao pode emitir', () => {
        const { container } = render(
            <FormularioEmitirRelatorio
                funcionarios={funcionarios}
                funcionarioId="f1"
                periodoInicio="2026-01-01"
                periodoFim="2026-01-31"
                podeEmitir={false}
                onAlterarFuncionario={vi.fn()}
                onAlterarPeriodoInicio={vi.fn()}
                onAlterarPeriodoFim={vi.fn()}
                onEmitir={vi.fn()}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('deve listar funcionario sem cargo no rotulo da opcao', () => {
        render(
            <FormularioEmitirRelatorio
                funcionarios={[{ id: 'f2', name: 'Bruno' }]}
                funcionarioId=""
                periodoInicio=""
                periodoFim=""
                onAlterarFuncionario={vi.fn()}
                onAlterarPeriodoInicio={vi.fn()}
                onAlterarPeriodoFim={vi.fn()}
                onEmitir={vi.fn()}
            />
        );

        expect(screen.getByRole('option', { name: 'Bruno' })).toBeInTheDocument();
    });
});

describe('usuarioPodeGerenciarRelatoriosEpi', () => {
    it('deve permitir ADMIN e ADMINISTRATIVO', () => {
        expect(usuarioPodeGerenciarRelatoriosEpi('ADMIN')).toBe(true);
        expect(usuarioPodeGerenciarRelatoriosEpi('ADMINISTRATIVO')).toBe(true);
    });

    it('deve negar outros papeis', () => {
        expect(usuarioPodeGerenciarRelatoriosEpi('ALMOXARIFADO')).toBe(false);
        expect(usuarioPodeGerenciarRelatoriosEpi('COLABORADOR')).toBe(false);
    });
});
