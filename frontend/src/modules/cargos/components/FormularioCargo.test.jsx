import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormularioCargo } from './FormularioCargo.jsx';

describe('FormularioCargo', () => {
    it('deve enviar nome e descrição', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<FormularioCargo onSubmit={onSubmit} rotuloEnviar="Cadastrar cargo" />);

        await usuario.type(screen.getByLabelText(/nome do cargo/i), 'Soldador');
        await usuario.type(screen.getByLabelText(/descrição/i), 'Soldagem MIG/MAG');
        await usuario.click(screen.getByRole('button', { name: /cadastrar cargo/i }));

        expect(onSubmit).toHaveBeenCalledWith({
            name: 'Soldador',
            description: 'Soldagem MIG/MAG'
        });
    });

    it('deve chamar onCancelar', async () => {
        const usuario = userEvent.setup();
        const onCancelar = vi.fn();

        render(<FormularioCargo onSubmit={vi.fn()} onCancelar={onCancelar} />);

        await usuario.click(screen.getByRole('button', { name: /cancelar/i }));

        expect(onCancelar).toHaveBeenCalled();
    });

    it('nao deve exibir acoes de salvar em modo somente leitura', () => {
        render(
            <FormularioCargo
                onSubmit={vi.fn()}
                somenteLeitura
                valoresIniciais={{ name: 'Soldador', description: 'Soldagem' }}
                linkVoltar={<a href="/admin/cargos">Voltar</a>}
            />
        );

        expect(screen.getByLabelText(/nome do cargo/i)).toBeDisabled();
        expect(screen.getByLabelText(/descrição/i)).toBeDisabled();
        expect(screen.queryByRole('button', { name: /salvar/i })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /voltar/i })).toBeInTheDocument();
    });
});
