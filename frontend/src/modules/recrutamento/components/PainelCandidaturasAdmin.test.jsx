import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { confirmarConviteCapturado } = vi.hoisted(() => ({
    confirmarConviteCapturado: { current: () => {} }
}));

vi.mock('../../../shared/components/DialogoConfirmacao.jsx', () => ({
    DialogoConfirmacao: ({ aberto, titulo, mensagem, onConfirmar, onCancelar }) => {
        confirmarConviteCapturado.current = onConfirmar;

        if (!aberto) {
            return null;
        }

        return (
            <div role="alertdialog">
                <h2>{titulo}</h2>
                <p>{mensagem}</p>
                <button type="button" onClick={onCancelar}>
                    cancelar-dialogo
                </button>
                <button type="button" onClick={onConfirmar}>
                    confirmar-dialogo
                </button>
            </div>
        );
    }
}));

vi.mock('./TabelaCandidaturas.jsx', () => ({
    TabelaCandidaturas: ({
        candidaturas,
        onAbrirDetalhe,
        onFecharDetalhe,
        onAlterarStatus,
        onBaixarCurriculo,
        onGerarConvite,
        onReativar
    }) => (
        <div>
            {candidaturas.map((candidatura) => (
                <div key={candidatura.id}>
                    <span>{candidatura.nomeCompleto}</span>
                    <button type="button" onClick={() => onAbrirDetalhe?.(candidatura)}>
                        abrir-{candidatura.id}
                    </button>
                    <button
                        type="button"
                        onClick={() => onAlterarStatus(candidatura.id, 'PROXIMA_FASE')}
                    >
                        alterar-{candidatura.id}
                    </button>
                    <button type="button" onClick={() => onBaixarCurriculo(candidatura.id)}>
                        baixar-{candidatura.id}
                    </button>
                    {onGerarConvite ? (
                        <button type="button" onClick={() => onGerarConvite(candidatura.id)}>
                            convite-{candidatura.id}
                        </button>
                    ) : null}
                    {onReativar ? (
                        <button type="button" onClick={() => onReativar(candidatura.id)}>
                            reativar-{candidatura.id}
                        </button>
                    ) : null}
                </div>
            ))}
            {onGerarConvite ? (
                <button type="button" onClick={() => onGerarConvite('id-inexistente')}>
                    convite-invalido
                </button>
            ) : null}
            <button type="button" onClick={() => onFecharDetalhe?.()}>
                fechar-detalhe
            </button>
        </div>
    )
}));

vi.mock('../services/recrutamentoApi.js', () => ({
    listarTodasCandidaturas: vi.fn(),
    atualizarStatusCandidatura: vi.fn(),
    baixarCurriculo: vi.fn(),
    gerarConviteCadastro: vi.fn(),
    marcarVisualizacaoCandidatura: vi.fn(),
    reativarCandidatura: vi.fn()
}));

const {
    listarTodasCandidaturas,
    atualizarStatusCandidatura,
    baixarCurriculo,
    gerarConviteCadastro,
    marcarVisualizacaoCandidatura,
    reativarCandidatura
} = await import('../services/recrutamentoApi.js');

const { PainelCandidaturasAdmin } = await import('./PainelCandidaturasAdmin.jsx');

function candidatura(sobrescritas = {}) {
    return {
        id: 'c1',
        nomeCompleto: 'Maria Silva',
        email: 'maria@teste.com',
        status: 'PENDENTE',
        curriculoNomeArquivo: 'cv.pdf',
        ...sobrescritas
    };
}

describe('PainelCandidaturasAdmin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        confirmarConviteCapturado.current = () => {};
        listarTodasCandidaturas.mockResolvedValue({ candidaturas: [candidatura()] });
        atualizarStatusCandidatura.mockResolvedValue({ id: 'c1', status: 'PROXIMA_FASE' });
        baixarCurriculo.mockResolvedValue(undefined);
        marcarVisualizacaoCandidatura.mockResolvedValue({ id: 'c1', descricaoVisualizadaEm: '2026-01-01' });
        reativarCandidatura.mockResolvedValue({ destino: 'CANDIDATURAS' });
        gerarConviteCadastro.mockResolvedValue({ emailEnviadoPara: 'maria@teste.com' });
    });

    it('deve carregar candidaturas com filtros padrao', async () => {
        render(<PainelCandidaturasAdmin token="jwt" />);

        expect(screen.getByText(/carregando candidaturas/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Maria Silva')).toBeInTheDocument();
        });

        expect(listarTodasCandidaturas).toHaveBeenCalledWith('jwt', {
            anuncioVagaId: undefined,
            status: undefined,
            incluirDescartadas: false,
            reativados: false,
            ordenacao: undefined
        });
        expect(screen.getByRole('heading', { name: 'Candidaturas' })).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar carregamento', async () => {
        listarTodasCandidaturas.mockRejectedValue(new Error());

        render(<PainelCandidaturasAdmin token="jwt" />);

        expect(
            await screen.findByText(/não foi possível carregar as candidaturas/i)
        ).toBeInTheDocument();
    });

    it('deve aplicar filtros de lixeira ignorando status selecionado', async () => {
        render(
            <PainelCandidaturasAdmin
                token="jwt"
                statusFiltro="PROXIMA_FASE"
                modoLixeira
                anuncioVagaId="v1"
            />
        );

        await waitFor(() => {
            expect(listarTodasCandidaturas).toHaveBeenCalledWith('jwt', {
                anuncioVagaId: 'v1',
                status: 'DESCARTADO',
                incluirDescartadas: true,
                reativados: false,
                ordenacao: undefined
            });
        });

        expect(await screen.findByRole('heading', { name: 'Lixeira' })).toBeInTheDocument();
    });

    it('deve ignorar filtro de vaga e exibir titulo de reativados', async () => {
        render(<PainelCandidaturasAdmin token="jwt" modoReativados anuncioVagaId="v1" />);

        await waitFor(() => {
            expect(listarTodasCandidaturas).toHaveBeenCalledWith('jwt', {
                anuncioVagaId: undefined,
                status: undefined,
                incluirDescartadas: false,
                reativados: true,
                ordenacao: undefined
            });
        });

        expect(await screen.findByRole('heading', { name: 'Reativados' })).toBeInTheDocument();
    });

    it('nao deve marcar visualizacao quando descricao ja tiver sido visualizada', async () => {
        listarTodasCandidaturas.mockResolvedValue({
            candidaturas: [candidatura({ descricaoVisualizadaEm: '2026-01-01' })]
        });
        const usuario = userEvent.setup({ delay: null });

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^abrir-c1$/i }));

        expect(marcarVisualizacaoCandidatura).not.toHaveBeenCalled();
    });

    it('deve marcar visualizacao ao abrir detalhe nao visualizado e ignorar falha silenciosamente', async () => {
        const usuario = userEvent.setup({ delay: null });
        marcarVisualizacaoCandidatura.mockRejectedValue(new Error('falhou'));

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^abrir-c1$/i }));

        await waitFor(() => {
            expect(marcarVisualizacaoCandidatura).toHaveBeenCalledWith('c1', 'DESCRICAO', 'jwt');
        });

        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    });

    it('deve fechar detalhe da candidatura', async () => {
        const usuario = userEvent.setup({ delay: null });

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^abrir-c1$/i }));
        await usuario.click(screen.getByRole('button', { name: /fechar-detalhe/i }));

        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    });

    it('deve alterar status da candidatura e recarregar lista', async () => {
        const usuario = userEvent.setup({ delay: null });

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^alterar-c1$/i }));

        await waitFor(() => {
            expect(atualizarStatusCandidatura).toHaveBeenCalledWith('c1', 'PROXIMA_FASE', 'jwt');
        });

        expect(listarTodasCandidaturas).toHaveBeenCalledTimes(2);
    });

    it('deve exibir erro ao falhar alteracao de status', async () => {
        const usuario = userEvent.setup({ delay: null });
        atualizarStatusCandidatura.mockRejectedValue(new Error('Status inválido'));

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^alterar-c1$/i }));

        expect(await screen.findByText('Status inválido')).toBeInTheDocument();
    });

    it('deve reativar candidatura descartada na lixeira e exibir erro ao falhar', async () => {
        const usuario = userEvent.setup({ delay: null });
        listarTodasCandidaturas.mockResolvedValue({
            candidaturas: [candidatura({ status: 'DESCARTADO' })]
        });

        render(<PainelCandidaturasAdmin token="jwt" modoLixeira />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^reativar-c1$/i }));

        await waitFor(() => {
            expect(reativarCandidatura).toHaveBeenCalledWith('c1', 'jwt');
        });

        reativarCandidatura.mockRejectedValue(new Error());
        await usuario.click(screen.getByRole('button', { name: /^reativar-c1$/i }));

        expect(
            await screen.findByText(/não foi possível reativar a candidatura/i)
        ).toBeInTheDocument();
    });

    it('deve baixar curriculo e marcar como visualizado, exibindo erro ao falhar', async () => {
        const usuario = userEvent.setup({ delay: null });

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^baixar-c1$/i }));

        await waitFor(() => {
            expect(baixarCurriculo).toHaveBeenCalledWith('c1', 'jwt');
        });

        baixarCurriculo.mockRejectedValue(new Error('Sem permissão'));
        await usuario.click(screen.getByRole('button', { name: /^baixar-c1$/i }));

        expect(await screen.findByText('Sem permissão')).toBeInTheDocument();
    });

    it('nao deve reenviar download quando curriculo ja tiver sido visualizado', async () => {
        const usuario = userEvent.setup({ delay: null });
        listarTodasCandidaturas.mockResolvedValue({
            candidaturas: [candidatura({ curriculoVisualizadoEm: '2026-01-01' })]
        });

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^baixar-c1$/i }));

        await waitFor(() => {
            expect(baixarCurriculo).toHaveBeenCalled();
        });
    });

    it('deve ignorar confirmacao de convite quando nao houver candidatura selecionada', () => {
        render(<PainelCandidaturasAdmin token="jwt" />);

        confirmarConviteCapturado.current();

        expect(gerarConviteCadastro).not.toHaveBeenCalled();
    });

    it('nao deve abrir dialogo de convite para candidatura inexistente', async () => {
        const usuario = userEvent.setup({ delay: null });

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /convite-invalido/i }));

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('deve enviar convite de cadastro com sucesso, usando e-mail de retorno e recarregando lista', async () => {
        const usuario = userEvent.setup({ delay: null });

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^convite-c1$/i }));

        const dialogo = await screen.findByRole('alertdialog');
        expect(dialogo).toHaveTextContent('maria@teste.com');

        await usuario.click(screen.getByRole('button', { name: /confirmar-dialogo/i }));

        await waitFor(() => {
            expect(gerarConviteCadastro).toHaveBeenCalledWith('c1', 'jwt');
        });

        expect(
            await screen.findByText(/e-mail de cadastro enviado para maria@teste\.com/i)
        ).toBeInTheDocument();
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('deve usar e-mail da candidatura quando resposta do convite nao tiver emailEnviadoPara', async () => {
        const usuario = userEvent.setup({ delay: null });
        gerarConviteCadastro.mockResolvedValue({});

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^convite-c1$/i }));
        await usuario.click(await screen.findByRole('button', { name: /confirmar-dialogo/i }));

        expect(
            await screen.findByText(/e-mail de cadastro enviado para maria@teste\.com/i)
        ).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar envio de convite e manter dialogo aberto', async () => {
        const usuario = userEvent.setup({ delay: null });
        gerarConviteCadastro.mockRejectedValue(new Error());

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^convite-c1$/i }));
        await usuario.click(await screen.findByRole('button', { name: /confirmar-dialogo/i }));

        expect(
            await screen.findByText(/não foi possível enviar o convite/i)
        ).toBeInTheDocument();
    });

    it('deve tratar resposta sem lista de candidaturas como lista vazia', async () => {
        listarTodasCandidaturas.mockResolvedValue({});

        render(<PainelCandidaturasAdmin token="jwt" />);

        await waitFor(() => {
            expect(screen.queryByText(/carregando candidaturas/i)).not.toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: 'Candidaturas' })).toBeInTheDocument();
    });

    it('deve atualizar apenas a candidatura correspondente quando o detalhe visualizado mudar antes da resposta', async () => {
        const usuario = userEvent.setup({ delay: null });
        listarTodasCandidaturas.mockResolvedValue({
            candidaturas: [
                candidatura({ id: 'c1', nomeCompleto: 'Maria Silva' }),
                candidatura({ id: 'c2', nomeCompleto: 'Pedro Souza' })
            ]
        });

        let resolverC1;
        let resolverC2;
        marcarVisualizacaoCandidatura
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        resolverC1 = resolve;
                    })
            )
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        resolverC2 = resolve;
                    })
            );

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^abrir-c1$/i }));
        await usuario.click(screen.getByRole('button', { name: /^abrir-c2$/i }));

        resolverC1({ id: 'c1', descricaoVisualizadaEm: '2026-01-01' });
        resolverC2({ id: 'c2', descricaoVisualizadaEm: '2026-01-01' });

        await waitFor(() => {
            expect(marcarVisualizacaoCandidatura).toHaveBeenCalledTimes(2);
        });

        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
        expect(screen.getByText('Pedro Souza')).toBeInTheDocument();
    });

    it('deve exibir mensagem generica ao falhar alteracao de status sem detalhe do erro', async () => {
        const usuario = userEvent.setup({ delay: null });
        atualizarStatusCandidatura.mockRejectedValue(new Error());

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^alterar-c1$/i }));

        expect(
            await screen.findByText(/não foi possível atualizar a candidatura/i)
        ).toBeInTheDocument();
    });

    it('deve exibir mensagem generica ao falhar download do curriculo sem detalhe do erro', async () => {
        const usuario = userEvent.setup({ delay: null });
        baixarCurriculo.mockRejectedValue(new Error());

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^baixar-c1$/i }));

        expect(
            await screen.findByText(/não foi possível baixar o currículo/i)
        ).toBeInTheDocument();
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
                props.onLimparAviso?.();
                props.onLimparSucesso?.();
                return original(props);
            });

        render(<PainelCandidaturasAdmin token="jwt" />);
        await screen.findByText('Maria Silva');

        spy.mockRestore();
    });

    it('deve cancelar envio de convite', async () => {
        const usuario = userEvent.setup({ delay: null });

        render(<PainelCandidaturasAdmin token="jwt" />);

        await screen.findByText('Maria Silva');
        await usuario.click(screen.getByRole('button', { name: /^convite-c1$/i }));
        await usuario.click(await screen.findByRole('button', { name: /cancelar-dialogo/i }));

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        expect(gerarConviteCadastro).not.toHaveBeenCalled();
    });
});
