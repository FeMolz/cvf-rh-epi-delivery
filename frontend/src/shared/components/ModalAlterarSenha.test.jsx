import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ModalAlterarSenha } from './ModalAlterarSenha.jsx';

describe('ModalAlterarSenha', () => {
    it('não deve renderizar quando fechado', () => {
        const { container } = render(
            <ModalAlterarSenha aberto={false} onConfirmar={vi.fn()} onCancelar={vi.fn()} />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('deve confirmar nova senha quando campos coincidem', async () => {
        const usuario = userEvent.setup();
        const onConfirmar = vi.fn().mockResolvedValue(undefined);

        render(
            <ModalAlterarSenha aberto onConfirmar={onConfirmar} onCancelar={vi.fn()} />
        );

        await usuario.type(screen.getByLabelText(/^nova senha$/i), 'senha1234');
        await usuario.type(screen.getByLabelText(/confirmar nova senha/i), 'senha1234');
        await usuario.click(screen.getByRole('button', { name: /salvar senha/i }));

        await waitFor(() => {
            expect(onConfirmar).toHaveBeenCalledWith('senha1234');
        });
    });

    it('deve rejeitar confirmação divergente', async () => {
        const usuario = userEvent.setup();
        const onConfirmar = vi.fn();

        render(
            <ModalAlterarSenha aberto onConfirmar={onConfirmar} onCancelar={vi.fn()} />
        );

        await usuario.type(screen.getByLabelText(/^nova senha$/i), 'senha1234');
        await usuario.type(screen.getByLabelText(/confirmar nova senha/i), 'outra1234');
        await usuario.click(screen.getByRole('button', { name: /salvar senha/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'A confirmação da senha não confere.'
        );
        expect(onConfirmar).not.toHaveBeenCalled();
    });

    it('deve rejeitar campos vazios', async () => {
        const usuario = userEvent.setup();
        const onConfirmar = vi.fn();

        render(
            <ModalAlterarSenha aberto onConfirmar={onConfirmar} onCancelar={vi.fn()} />
        );

        await usuario.click(screen.getByRole('button', { name: /salvar senha/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Informe a nova senha e a confirmação.'
        );
        expect(onConfirmar).not.toHaveBeenCalled();
    });

    it('deve exibir erro da API e permitir cancelar', async () => {
        const usuario = userEvent.setup();
        const onConfirmar = vi.fn().mockRejectedValue(new Error('Falha na API.'));
        const onCancelar = vi.fn();

        render(
            <ModalAlterarSenha aberto onConfirmar={onConfirmar} onCancelar={onCancelar} />
        );

        await usuario.type(screen.getByLabelText(/^nova senha$/i), 'senha1234');
        await usuario.type(screen.getByLabelText(/confirmar nova senha/i), 'senha1234');
        await usuario.click(screen.getByRole('button', { name: /salvar senha/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha na API.');

        await usuario.click(screen.getByRole('button', { name: /cancelar/i }));
        expect(onCancelar).toHaveBeenCalled();
    });

    it('deve exibir erro generico quando API falhar sem mensagem', async () => {
        const usuario = userEvent.setup();
        const onConfirmar = vi.fn().mockRejectedValue(new Error());

        render(
            <ModalAlterarSenha aberto onConfirmar={onConfirmar} onCancelar={vi.fn()} />
        );

        await usuario.type(screen.getByLabelText(/^nova senha$/i), 'senha1234');
        await usuario.type(screen.getByLabelText(/confirmar nova senha/i), 'senha1234');
        await usuario.click(screen.getByRole('button', { name: /salvar senha/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível alterar a senha.'
        );
    });

    it('deve fechar ao clicar no backdrop', async () => {
        const usuario = userEvent.setup();
        const onCancelar = vi.fn();

        const { container } = render(
            <ModalAlterarSenha aberto onConfirmar={vi.fn()} onCancelar={onCancelar} />
        );

        await usuario.click(container.querySelector('.dialogo-confirmacao'));
        expect(onCancelar).toHaveBeenCalled();
    });

    it('não deve fechar ao clicar no cartão do modal', async () => {
        const usuario = userEvent.setup();
        const onCancelar = vi.fn();

        render(
            <ModalAlterarSenha aberto onConfirmar={vi.fn()} onCancelar={onCancelar} />
        );

        await usuario.click(screen.getByRole('dialog'));
        expect(onCancelar).not.toHaveBeenCalled();
    });

    it('deve exibir estado de carregamento', () => {
        render(
            <ModalAlterarSenha
                aberto
                carregando
                onConfirmar={vi.fn()}
                onCancelar={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: /alterando/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
    });
});
