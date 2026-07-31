import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { STATUS_CADASTRO_CONTRATACAO } from '../constants/recrutamentoConstantes.js';

const listarCadastrosContratacao = vi.fn();
const reenviarEmailConviteCadastro = vi.fn();
const atualizarStatusCadastroContratacao = vi.fn();

vi.mock('../services/recrutamentoApi.js', () => ({
    listarCadastrosContratacao: (...args) => listarCadastrosContratacao(...args),
    reenviarEmailConviteCadastro: (...args) => reenviarEmailConviteCadastro(...args),
    atualizarStatusCadastroContratacao: (...args) => atualizarStatusCadastroContratacao(...args)
}));

const { confirmarCancelamentoCapturado } = vi.hoisted(() => ({
    confirmarCancelamentoCapturado: { current: () => {} }
}));

vi.mock('../../../shared/components/DialogoConfirmacao.jsx', () => ({
    DialogoConfirmacao: ({
        aberto,
        titulo,
        mensagem,
        rotuloConfirmar = 'Confirmar',
        rotuloCancelar = 'Cancelar',
        onConfirmar,
        onCancelar
    }) => {
        confirmarCancelamentoCapturado.current = onConfirmar;

        if (!aberto) {
            return null;
        }

        return (
            <div role="alertdialog">
                <h2>{titulo}</h2>
                <p>{mensagem}</p>
                <button type="button" onClick={onCancelar}>
                    {rotuloCancelar}
                </button>
                <button type="button" onClick={onConfirmar}>
                    {rotuloConfirmar}
                </button>
            </div>
        );
    }
}));

const { PainelProcessoAprovacao } = await import('./PainelProcessoAprovacao.jsx');

describe('PainelProcessoAprovacao', () => {
    const cadastro = {
        id: 'cad1',
        name: 'Maria Silva',
        email: 'maria@email.com',
        status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO,
        candidatura: {
            nomeCompleto: 'Maria Silva',
            email: 'maria@email.com',
            anuncioVaga: { tituloVaga: 'Analista' }
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        confirmarCancelamentoCapturado.current = () => {};
        listarCadastrosContratacao.mockResolvedValue([cadastro]);
        atualizarStatusCadastroContratacao.mockResolvedValue({
            id: 'cad1',
            status: STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO
        });
        reenviarEmailConviteCadastro.mockResolvedValue({ emailEnviadoPara: 'maria@email.com' });
    });

    it('deve exibir erro generico e customizado ao falhar carregamento', async () => {
        listarCadastrosContratacao.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <PainelProcessoAprovacao token="token-teste" />
            </MemoryRouter>
        );

        expect(
            await screen.findByText(/não foi possível carregar o processo de aprovação/i)
        ).toBeInTheDocument();
    });

    it('deve tratar resposta que nao seja um array como lista vazia', async () => {
        listarCadastrosContratacao.mockResolvedValue(null);

        render(
            <MemoryRouter>
                <PainelProcessoAprovacao token="token-teste" />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.queryByText(/carregando processo de aprovação/i)
            ).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument();
    });

    it('deve reenviar e-mail com sucesso e exibir erros ao falhar', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <PainelProcessoAprovacao token="token-teste" />
            </MemoryRouter>
        );

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /reenviar e-mail/i }));

        await waitFor(() => {
            expect(reenviarEmailConviteCadastro).toHaveBeenCalledWith('cad1', 'token-teste');
        });

        expect(
            await screen.findByText(/e-mail reenviado para maria@email\.com/i)
        ).toBeInTheDocument();

        reenviarEmailConviteCadastro.mockRejectedValue(new Error());
        await usuario.click(screen.getByRole('button', { name: /reenviar e-mail/i }));

        expect(
            await screen.findByText(/não foi possível reenviar o e-mail/i)
        ).toBeInTheDocument();
    });

    it('deve usar mensagem padrao quando o reenvio de e-mail nao retornar destinatario', async () => {
        const usuario = userEvent.setup();
        reenviarEmailConviteCadastro.mockResolvedValue({});

        render(
            <MemoryRouter>
                <PainelProcessoAprovacao token="token-teste" />
            </MemoryRouter>
        );

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /reenviar e-mail/i }));

        expect(
            await screen.findByText(/e-mail reenviado para o candidato/i)
        ).toBeInTheDocument();
    });

    it('deve ignorar cancelamento quando nao houver cadastro selecionado', async () => {
        render(
            <MemoryRouter>
                <PainelProcessoAprovacao token="token-teste" />
            </MemoryRouter>
        );

        await screen.findByText('Maria Silva');

        confirmarCancelamentoCapturado.current();

        expect(atualizarStatusCadastroContratacao).not.toHaveBeenCalled();
    });

    it('deve exibir erro customizado ao falhar cancelamento e fechar dialogo', async () => {
        const usuario = userEvent.setup();
        atualizarStatusCadastroContratacao.mockRejectedValue(new Error('Falha ao cancelar'));

        render(
            <MemoryRouter>
                <PainelProcessoAprovacao token="token-teste" />
            </MemoryRouter>
        );

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /cancelar processo/i }));

        const dialogo = screen.getByRole('alertdialog');
        await usuario.click(within(dialogo).getByRole('button', { name: /^cancelar processo$/i }));

        expect(await screen.findByText('Falha ao cancelar')).toBeInTheDocument();
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('deve exibir mensagem generica ao falhar cancelamento sem detalhe do erro', async () => {
        const usuario = userEvent.setup();
        atualizarStatusCadastroContratacao.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <PainelProcessoAprovacao token="token-teste" />
            </MemoryRouter>
        );

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /cancelar processo/i }));

        const dialogo = screen.getByRole('alertdialog');
        await usuario.click(within(dialogo).getByRole('button', { name: /^cancelar processo$/i }));

        expect(
            await screen.findByText(/não foi possível cancelar o processo/i)
        ).toBeInTheDocument();
    });

    it('deve usar o nome da candidatura no dialogo quando o cadastro nao tiver nome direto', async () => {
        const usuario = userEvent.setup();
        listarCadastrosContratacao.mockResolvedValue([
            {
                id: 'cad5',
                status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO,
                candidatura: { nomeCompleto: 'Nome via candidatura' }
            }
        ]);

        render(
            <MemoryRouter>
                <PainelProcessoAprovacao token="token-teste" />
            </MemoryRouter>
        );

        await screen.findByText('Nome via candidatura');
        await usuario.click(screen.getByRole('button', { name: /cancelar processo/i }));

        const dialogo = screen.getByRole('alertdialog');
        expect(dialogo).toHaveTextContent('Nome via candidatura');
    });

    it('deve invocar callbacks de limpeza das mensagens de feedback', async () => {
        const MensagemFeedbackModule = await import(
            '../../../shared/components/MensagemFeedback.jsx'
        );
        const original = MensagemFeedbackModule.AreaMensagensFeedback;
        const spy = vi
            .spyOn(MensagemFeedbackModule, 'AreaMensagensFeedback')
            .mockImplementation((props) => {
                props.onLimparErro?.();
                props.onLimparSucesso?.();
                return original(props);
            });

        render(
            <MemoryRouter>
                <PainelProcessoAprovacao token="token-teste" />
            </MemoryRouter>
        );
        await screen.findByText('Maria Silva');

        spy.mockRestore();
    });

    it('deve fechar dialogo ao voltar sem confirmar cancelamento', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <PainelProcessoAprovacao token="token-teste" />
            </MemoryRouter>
        );

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /cancelar processo/i }));

        const dialogo = screen.getByRole('alertdialog');
        await usuario.click(within(dialogo).getByRole('button', { name: /voltar/i }));

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        expect(atualizarStatusCadastroContratacao).not.toHaveBeenCalled();
    });

    it('deve cancelar processo apos confirmacao e remover da lista', async () => {
        const usuario = userEvent.setup();
        listarCadastrosContratacao
            .mockResolvedValueOnce([cadastro])
            .mockResolvedValueOnce([]);

        render(
            <MemoryRouter>
                <PainelProcessoAprovacao token="token-teste" />
            </MemoryRouter>
        );

        expect(await screen.findByText('Maria Silva')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /cancelar processo/i }));

        const dialogo = screen.getByRole('alertdialog');
        expect(within(dialogo).getByRole('heading', { name: /cancelar processo/i })).toBeInTheDocument();

        await usuario.click(
            within(dialogo).getByRole('button', { name: /^cancelar processo$/i })
        );

        await waitFor(() => {
            expect(atualizarStatusCadastroContratacao).toHaveBeenCalledWith(
                'cad1',
                { status: STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO },
                'token-teste'
            );
        });

        expect(
            await screen.findByText(/processo cancelado\. o candidato foi movido para a lixeira/i)
        ).toBeInTheDocument();
    });
});
