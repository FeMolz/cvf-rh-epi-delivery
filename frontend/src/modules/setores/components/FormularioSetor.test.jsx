import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as MensagemFeedback from '../../../shared/components/MensagemFeedback.jsx';
import { FormularioSetor } from './FormularioSetor.jsx';

describe('FormularioSetor', () => {
    it('deve enviar nome do setor', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<FormularioSetor onSubmit={onSubmit} rotuloEnviar="Cadastrar setor" />);

        await usuario.type(screen.getByLabelText(/nome do setor/i), 'ADMINISTRATIVO');
        await usuario.click(screen.getByRole('button', { name: /cadastrar setor/i }));

        expect(onSubmit).toHaveBeenCalledWith({ nome: 'ADMINISTRATIVO' });
    });

    it('deve chamar onCancelar', async () => {
        const usuario = userEvent.setup();
        const onCancelar = vi.fn();

        render(<FormularioSetor onSubmit={vi.fn()} onCancelar={onCancelar} />);

        await usuario.click(screen.getByRole('button', { name: /cancelar/i }));

        expect(onCancelar).toHaveBeenCalled();
    });

    it('nao deve exibir acoes de salvar em modo somente leitura', () => {
        render(
            <FormularioSetor
                onSubmit={vi.fn()}
                somenteLeitura
                valoresIniciais={{ nome: 'ADMINISTRATIVO' }}
                linkVoltar={<a href="/admin/setores">Voltar</a>}
            />
        );

        expect(screen.getByLabelText(/nome do setor/i)).toBeDisabled();
        expect(screen.queryByRole('button', { name: /salvar/i })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /voltar/i })).toBeInTheDocument();
    });

    it('deve exibir sucesso e limpar campos apos cadastro', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<FormularioSetor onSubmit={onSubmit} rotuloEnviar="Cadastrar setor" />);

        await usuario.type(screen.getByLabelText(/nome do setor/i), 'ADMINISTRATIVO');
        await usuario.click(screen.getByRole('button', { name: /cadastrar setor/i }));

        expect(await screen.findByRole('status')).toHaveTextContent(/setor salvo com sucesso/i);
        expect(screen.getByLabelText(/nome do setor/i)).toHaveValue('');
    });

    it('deve exibir erro quando submit falhar', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockRejectedValue(new Error('Falha ao salvar.'));

        render(<FormularioSetor onSubmit={onSubmit} />);

        await usuario.type(screen.getByLabelText(/nome do setor/i), 'ADMINISTRATIVO');
        await usuario.click(screen.getByRole('button', { name: /salvar setor/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao salvar.');
    });

    it('deve exibir rotulo salvando quando carregando', () => {
        render(<FormularioSetor onSubmit={vi.fn()} carregando rotuloEnviar="Salvar alterações" />);

        expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
    });

    it('deve exibir barra de acoes com voltar em modo edicao', () => {
        render(
            <FormularioSetor
                onSubmit={vi.fn()}
                valoresIniciais={{ nome: 'ADMINISTRATIVO' }}
                rotuloEnviar="Salvar alterações"
                linkVoltar={<a href="/admin/setores">Voltar</a>}
            />
        );

        expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /voltar/i })).toBeInTheDocument();
    });

    it('nao deve enviar em modo somente leitura', () => {
        const onSubmit = vi.fn();

        const { container } = render(
            <FormularioSetor
                onSubmit={onSubmit}
                somenteLeitura
                valoresIniciais={{ nome: 'ADMINISTRATIVO' }}
            />
        );

        fireEvent.submit(container.querySelector('form'));
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('deve exibir erro quando submit falhar sem message', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockRejectedValue({});

        render(<FormularioSetor onSubmit={onSubmit} />);

        await usuario.type(screen.getByLabelText(/nome do setor/i), 'ADMINISTRATIVO');
        await usuario.click(screen.getByRole('button', { name: /salvar setor/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            /não foi possível salvar o setor/i
        );
    });

    it('deve exibir barra de acoes com exclusao em modo edicao', () => {
        render(
            <FormularioSetor
                onSubmit={vi.fn()}
                valoresIniciais={{ nome: 'ADMINISTRATIVO' }}
                rotuloEnviar="Salvar alterações"
                acaoExcluir={<button type="button">Desativar setor</button>}
            />
        );

        expect(screen.getByRole('button', { name: /desativar setor/i })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /voltar/i })).not.toBeInTheDocument();
    });

    it('deve limpar mensagens via callbacks do feedback', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        const original = MensagemFeedback.AreaMensagensFeedback;
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.sucesso && props.onLimparSucesso) {
                props.onLimparSucesso();
            }

            return original(props);
        });

        render(<FormularioSetor onSubmit={onSubmit} />);

        await usuario.type(screen.getByLabelText(/nome do setor/i), 'ADMINISTRATIVO');
        await usuario.click(screen.getByRole('button', { name: /salvar setor/i }));

        await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });
});
