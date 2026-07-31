import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ModalCandidatura } from './ModalCandidatura.jsx';

describe('ModalCandidatura', () => {
    it('nao deve renderizar quando fechado', () => {
        const { container } = render(
            <ModalCandidatura aberto={false} onConfirmar={vi.fn()} onCancelar={vi.fn()} />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('deve confirmar dados preenchidos e cancelar', async () => {
        const usuario = userEvent.setup({ delay: null });
        const onConfirmar = vi.fn();
        const onCancelar = vi.fn();

        render(
            <ModalCandidatura aberto onConfirmar={onConfirmar} onCancelar={onCancelar} />
        );

        await usuario.type(screen.getByLabelText(/^telefone$/i), '11999999999');
        await usuario.type(screen.getByLabelText(/^cidade$/i), 'São Paulo');
        await usuario.type(screen.getByLabelText(/^estado$/i), 'SP');
        await usuario.type(screen.getByLabelText(/mensagem/i), 'Olá');

        const arquivo = new File(['pdf'], 'curriculo.pdf', { type: 'application/pdf' });
        await usuario.upload(screen.getByLabelText(/currículo/i), arquivo);

        await usuario.click(screen.getByRole('button', { name: /confirmar candidatura/i }));

        expect(onConfirmar).toHaveBeenCalledWith(
            expect.objectContaining({
                telefone: '11999999999',
                cidade: 'São Paulo',
                estado: 'SP',
                mensagemCandidato: 'Olá',
                curriculo: arquivo
            })
        );

        await usuario.click(screen.getByRole('button', { name: /cancelar/i }));
        expect(onCancelar).toHaveBeenCalled();
    });

    it('deve manter curriculo nulo quando nenhum arquivo for selecionado', () => {
        const onConfirmar = vi.fn();

        render(<ModalCandidatura aberto onConfirmar={onConfirmar} onCancelar={vi.fn()} />);

        fireEvent.change(screen.getByLabelText(/currículo/i), { target: { files: [] } });
        fireEvent.submit(screen.getByRole('button', { name: /confirmar candidatura/i }).closest('form'));

        expect(onConfirmar).toHaveBeenCalledWith(expect.objectContaining({ curriculo: null }));
    });

    it('deve cancelar ao clicar no fundo e exibir estado enviando', () => {
        const onCancelar = vi.fn();

        render(
            <ModalCandidatura aberto carregando onConfirmar={vi.fn()} onCancelar={onCancelar} />
        );

        expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled();
        fireEvent.click(screen.getByRole('presentation'));
        expect(onCancelar).toHaveBeenCalled();
    });
});
