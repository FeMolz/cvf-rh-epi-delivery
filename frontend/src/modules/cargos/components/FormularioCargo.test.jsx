import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as MensagemFeedback from '../../../shared/components/MensagemFeedback.jsx';
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
            name: 'SOLDADOR',
            description: 'SOLDAGEM MIG/MAG'
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

    it('deve exibir sucesso e limpar campos apos cadastro', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<FormularioCargo onSubmit={onSubmit} rotuloEnviar="Cadastrar cargo" />);

        await usuario.type(screen.getByLabelText(/nome do cargo/i), 'Soldador');
        await usuario.type(screen.getByLabelText(/descrição/i), 'Soldagem');
        await usuario.click(screen.getByRole('button', { name: /cadastrar cargo/i }));

        expect(await screen.findByRole('status')).toHaveTextContent(/cargo salvo com sucesso/i);
        expect(screen.getByLabelText(/nome do cargo/i)).toHaveValue('');
        expect(screen.getByLabelText(/descrição/i)).toHaveValue('');
    });

    it('deve exibir erro quando submit falhar', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockRejectedValue(new Error('Falha ao salvar.'));

        render(<FormularioCargo onSubmit={onSubmit} />);

        await usuario.type(screen.getByLabelText(/nome do cargo/i), 'Soldador');
        await usuario.type(screen.getByLabelText(/descrição/i), 'Soldagem');
        await usuario.click(screen.getByRole('button', { name: /salvar cargo/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao salvar.');
    });

    it('deve exibir erro quando submit falhar sem message', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockRejectedValue({});

        render(<FormularioCargo onSubmit={onSubmit} />);

        await usuario.type(screen.getByLabelText(/nome do cargo/i), 'Soldador');
        await usuario.type(screen.getByLabelText(/descrição/i), 'Soldagem');
        await usuario.click(screen.getByRole('button', { name: /salvar cargo/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            /não foi possível salvar o cargo/i
        );
    });

    it('deve exibir rotulo salvando quando carregando', () => {
        render(<FormularioCargo onSubmit={vi.fn()} carregando rotuloEnviar="Salvar alterações" />);

        expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
    });

    it('deve exibir acoes em modo somente leitura com exclusao', () => {
        render(
            <FormularioCargo
                onSubmit={vi.fn()}
                somenteLeitura
                valoresIniciais={{ name: 'Soldador', description: 'Soldagem' }}
                acaoExcluir={<button type="button">Desativar cargo</button>}
                linkVoltar={<a href="/admin/cargos">Voltar</a>}
            />
        );

        expect(screen.getByRole('button', { name: /desativar cargo/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /voltar/i })).toBeInTheDocument();
    });

    it('deve exibir barra de acoes com voltar e exclusao em modo edicao', () => {
        render(
            <FormularioCargo
                onSubmit={vi.fn()}
                valoresIniciais={{ name: 'Soldador', description: 'Soldagem' }}
                rotuloEnviar="Salvar alterações"
                acaoExcluir={<button type="button">Desativar cargo</button>}
                linkVoltar={<a href="/admin/cargos">Voltar</a>}
            />
        );

        expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /desativar cargo/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /voltar/i })).toBeInTheDocument();
    });

    it('nao deve enviar em modo somente leitura', async () => {
        const onSubmit = vi.fn();

        const { container } = render(
            <FormularioCargo
                onSubmit={onSubmit}
                somenteLeitura
                valoresIniciais={{ name: 'Soldador', description: 'Soldagem' }}
            />
        );

        fireEvent.submit(container.querySelector('form'));
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('deve limpar mensagens via callbacks do feedback', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        const original = MensagemFeedback.AreaMensagensFeedback;
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => (
            <div>
                {props.sucesso ? (
                    <button type="button" onClick={props.onLimparSucesso}>
                        limpar-sucesso
                    </button>
                ) : null}
                {props.erro ? (
                    <button type="button" onClick={props.onLimparErro}>
                        limpar-erro
                    </button>
                ) : null}
                {original(props)}
            </div>
        ));

        render(<FormularioCargo onSubmit={onSubmit} />);

        await usuario.type(screen.getByLabelText(/nome do cargo/i), 'Soldador');
        await usuario.type(screen.getByLabelText(/descrição/i), 'Soldagem');
        await usuario.click(screen.getByRole('button', { name: /salvar cargo/i }));

        expect(await screen.findByRole('button', { name: 'limpar-sucesso' })).toBeInTheDocument();
        await usuario.click(screen.getByRole('button', { name: 'limpar-sucesso' }));

        await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });

        onSubmit.mockRejectedValueOnce(new Error('Falha ao salvar.'));
        await usuario.type(screen.getByLabelText(/nome do cargo/i), 'Soldador');
        await usuario.type(screen.getByLabelText(/descrição/i), 'Soldagem');
        await usuario.click(screen.getByRole('button', { name: /salvar cargo/i }));

        expect(await screen.findByRole('button', { name: 'limpar-erro' })).toBeInTheDocument();
        await usuario.click(screen.getByRole('button', { name: 'limpar-erro' }));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });

    it('deve exibir acoes de edicao apenas com exclusao', () => {
        render(
            <FormularioCargo
                onSubmit={vi.fn()}
                valoresIniciais={{ name: 'Soldador', description: 'Soldagem' }}
                rotuloEnviar="Salvar alterações"
                acaoExcluir={<button type="button">Desativar cargo</button>}
            />
        );

        expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /desativar cargo/i })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /voltar/i })).not.toBeInTheDocument();
    });

    it('nao deve limpar campos apos edicao bem sucedida', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <FormularioCargo
                onSubmit={onSubmit}
                valoresIniciais={{ name: 'Soldador', description: 'Soldagem' }}
            />
        );

        await usuario.click(screen.getByRole('button', { name: /salvar cargo/i }));

        expect(await screen.findByRole('status')).toHaveTextContent(/cargo salvo com sucesso/i);
        expect(screen.getByLabelText(/nome do cargo/i)).toHaveValue('Soldador');
    });
});
