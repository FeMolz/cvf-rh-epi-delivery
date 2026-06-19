import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DialogoConfirmacao } from './DialogoConfirmacao.jsx';

describe('DialogoConfirmacao', () => {
    it('não deve renderizar quando fechado', () => {
        render(
            <DialogoConfirmacao
                aberto={false}
                titulo="Excluir"
                mensagem="Confirma?"
                onConfirmar={vi.fn()}
                onCancelar={vi.fn()}
            />
        );

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('deve chamar onConfirmar e onCancelar', async () => {
        const usuario = userEvent.setup();
        const onConfirmar = vi.fn();
        const onCancelar = vi.fn();

        render(
            <DialogoConfirmacao
                aberto
                titulo="Excluir cargo"
                mensagem="Tem certeza?"
                rotuloConfirmar="Excluir"
                onConfirmar={onConfirmar}
                onCancelar={onCancelar}
            />
        );

        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Excluir cargo' })).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));
        expect(onCancelar).toHaveBeenCalled();

        await usuario.click(screen.getByRole('button', { name: 'Excluir' }));
        expect(onConfirmar).toHaveBeenCalled();
    });
});
