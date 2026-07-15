import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormularioFuncionarioEtapa3 } from './FormularioFuncionarioEtapa3.jsx';

describe('FormularioFuncionarioEtapa3', () => {
    it('deve exibir beneficios iniciais e finalizar', async () => {
        const usuario = userEvent.setup();
        const onFinalizar = vi.fn();

        render(
            <FormularioFuncionarioEtapa3
                valoresIniciais={{
                    valeTransporte: true,
                    valeAlimentacao: false,
                    planoSaude: true
                }}
                onVoltar={vi.fn()}
                onFinalizar={onFinalizar}
            />
        );

        expect(screen.getByLabelText(/vale transporte/i)).toBeChecked();
        expect(screen.getByLabelText(/vale alimentação/i)).not.toBeChecked();
        expect(screen.getByLabelText(/plano de saúde/i)).toBeChecked();

        await usuario.click(screen.getByLabelText(/vale alimentação/i));
        await usuario.click(screen.getByRole('button', { name: /finalizar cadastro/i }));

        expect(onFinalizar).toHaveBeenCalledWith({
            valeTransporte: true,
            valeAlimentacao: true,
            planoSaude: true
        });
    });

    it('deve voltar e exibir estado de carregamento', async () => {
        const usuario = userEvent.setup();
        const onVoltar = vi.fn();

        render(
            <FormularioFuncionarioEtapa3
                onVoltar={onVoltar}
                onFinalizar={vi.fn()}
                carregando
                rotuloFinalizar="Salvar alterações"
            />
        );

        expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();

        await usuario.click(screen.getByRole('button', { name: /voltar/i }));
        expect(onVoltar).not.toHaveBeenCalled();
    });

    it('deve desmarcar beneficios e voltar quando nao estiver carregando', async () => {
        const usuario = userEvent.setup();
        const onVoltar = vi.fn();
        const onFinalizar = vi.fn();

        render(
            <FormularioFuncionarioEtapa3
                valoresIniciais={{
                    valeTransporte: true,
                    valeAlimentacao: true,
                    planoSaude: true
                }}
                onVoltar={onVoltar}
                onFinalizar={onFinalizar}
            />
        );

        await usuario.click(screen.getByLabelText(/vale transporte/i));
        await usuario.click(screen.getByLabelText(/plano de saúde/i));
        await usuario.click(screen.getByRole('button', { name: /voltar/i }));

        expect(onVoltar).toHaveBeenCalled();

        await usuario.click(screen.getByRole('button', { name: /finalizar cadastro/i }));

        expect(onFinalizar).toHaveBeenCalledWith({
            valeTransporte: false,
            valeAlimentacao: true,
            planoSaude: false
        });
    });
});
