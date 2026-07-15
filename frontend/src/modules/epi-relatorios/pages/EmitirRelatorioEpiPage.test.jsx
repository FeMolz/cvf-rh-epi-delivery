import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EmitirRelatorioEpiPage } from './EmitirRelatorioEpiPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/epiRelatoriosApi.js', () => ({
    listarFuncionariosElegiveisEmissaoRelatorio: vi.fn(),
    buscarPreviewRelatorioEntregaEpi: vi.fn(),
    emitirRelatorioEntregaEpi: vi.fn()
}));

vi.mock('../components/FormularioEmitirRelatorio.jsx', async () => {
    const actual = await vi.importActual('../components/FormularioEmitirRelatorio.jsx');

    return {
        ...actual,
        FormularioEmitirRelatorio: (props) => (
            <>
                <actual.FormularioEmitirRelatorio {...props} />
                <button type="button" onClick={props.onEmitir}>
                    Forcar emitir
                </button>
            </>
        )
    };
});

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const {
    listarFuncionariosElegiveisEmissaoRelatorio,
    buscarPreviewRelatorioEntregaEpi,
    emitirRelatorioEntregaEpi
} = await import('../services/epiRelatoriosApi.js');

function renderizarPagina(role = 'ADMIN') {
    useAuth.mockReturnValue({ token: 'jwt', user: { role } });

    return render(
        <MemoryRouter initialEntries={['/admin/epis/relatorios/emitir']}>
            <Routes>
                <Route path="/admin/epis/relatorios/emitir" element={<EmitirRelatorioEpiPage />} />
                <Route path="/admin/epis/relatorios/ultimas" element={<p>Últimas emissões</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('EmitirRelatorioEpiPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        listarFuncionariosElegiveisEmissaoRelatorio.mockResolvedValue([
            { id: 'f1', name: 'Ana Silva', roleName: 'Soldador' }
        ]);
        buscarPreviewRelatorioEntregaEpi.mockResolvedValue({
            textoPeriodoReferencia: '01/01/2026 a 31/01/2026',
            employee: { name: 'Ana Silva', roleName: 'Soldador' },
            entregas: [
                {
                    dataEntrega: '10/01/2026',
                    nomeEquipamento: 'Capacete',
                    numeroCa: '12345'
                }
            ]
        });
        emitirRelatorioEntregaEpi.mockResolvedValue({ id: 'r1' });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('deve redirecionar usuario sem permissao', () => {
        renderizarPagina('ALMOXARIFADO');
        expect(screen.getByText('Últimas emissões')).toBeInTheDocument();
    });

    it('deve carregar funcionarios e exibir preview apos selecionar periodo', async () => {
        const usuario = userEvent.setup();
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.type(screen.getByLabelText(/período início/i), '2026-01-01');
        await usuario.type(screen.getByLabelText(/período fim/i), '2026-01-31');

        await vi.advanceTimersByTimeAsync(400);

        await waitFor(() => {
            expect(buscarPreviewRelatorioEntregaEpi).toHaveBeenCalled();
            expect(screen.getByText('Capacete')).toBeInTheDocument();
        });
    });

    it('deve emitir relatorio com sucesso', async () => {
        const usuario = userEvent.setup();
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.type(screen.getByLabelText(/período início/i), '2026-01-01');
        await usuario.type(screen.getByLabelText(/período fim/i), '2026-01-31');
        await vi.advanceTimersByTimeAsync(400);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /gerar relatório/i })).not.toBeDisabled();
        });

        await usuario.click(screen.getByRole('button', { name: /gerar relatório/i }));

        await waitFor(() => {
            expect(emitirRelatorioEntregaEpi).toHaveBeenCalled();
            expect(screen.getByText(/relatório gerado com sucesso/i)).toBeInTheDocument();
        });
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        listarFuncionariosElegiveisEmissaoRelatorio.mockRejectedValue(new Error('Falha na API'));
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByText('Falha na API')).toBeInTheDocument();
        });
    });

    it('deve exibir erro generico ao falhar carregamento', async () => {
        listarFuncionariosElegiveisEmissaoRelatorio.mockRejectedValue(new Error());
        renderizarPagina();

        expect(await screen.findByText(/não foi possível carregar os funcionários/i)).toBeInTheDocument();
    });

    it('deve validar emissao sem periodo completo', async () => {
        const usuario = userEvent.setup();
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /forcar emitir/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /forcar emitir/i }));

        expect(
            await screen.findByText(/selecione o funcionário e o período para gerar o relatório/i)
        ).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar preview do relatorio', async () => {
        const usuario = userEvent.setup();
        buscarPreviewRelatorioEntregaEpi.mockRejectedValue(new Error('Preview indisponível'));
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.type(screen.getByLabelText(/período início/i), '2026-01-01');
        await usuario.type(screen.getByLabelText(/período fim/i), '2026-01-31');
        await vi.advanceTimersByTimeAsync(400);

        expect(await screen.findByText('Preview indisponível')).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar preview do relatorio', async () => {
        const usuario = userEvent.setup();
        buscarPreviewRelatorioEntregaEpi.mockRejectedValue(new Error());
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.type(screen.getByLabelText(/período início/i), '2026-01-01');
        await usuario.type(screen.getByLabelText(/período fim/i), '2026-01-31');
        await vi.advanceTimersByTimeAsync(400);

        expect(
            await screen.findByText(/não foi possível carregar a prévia do relatório/i)
        ).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar emissao do relatorio', async () => {
        const usuario = userEvent.setup();
        emitirRelatorioEntregaEpi.mockRejectedValue(new Error('Erro na emissão'));
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.type(screen.getByLabelText(/período início/i), '2026-01-01');
        await usuario.type(screen.getByLabelText(/período fim/i), '2026-01-31');
        await vi.advanceTimersByTimeAsync(400);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /gerar relatório/i })).not.toBeDisabled();
        });

        await usuario.click(screen.getByRole('button', { name: /gerar relatório/i }));

        expect(await screen.findByText('Erro na emissão')).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar emissao do relatorio', async () => {
        const usuario = userEvent.setup();
        emitirRelatorioEntregaEpi.mockRejectedValue(new Error());
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.type(screen.getByLabelText(/período início/i), '2026-01-01');
        await usuario.type(screen.getByLabelText(/período fim/i), '2026-01-31');
        await vi.advanceTimersByTimeAsync(400);
        await usuario.click(screen.getByRole('button', { name: /gerar relatório/i }));

        expect(await screen.findByText(/não foi possível gerar o relatório/i)).toBeInTheDocument();
    });

    it('deve limpar mensagens de feedback automaticamente', async () => {
        const usuario = userEvent.setup();
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.type(screen.getByLabelText(/período início/i), '2026-01-01');
        await usuario.type(screen.getByLabelText(/período fim/i), '2026-01-31');
        await vi.advanceTimersByTimeAsync(400);
        await usuario.click(screen.getByRole('button', { name: /gerar relatório/i }));

        expect(await screen.findByText(/relatório gerado com sucesso/i)).toBeInTheDocument();

        await vi.advanceTimersByTimeAsync(2000);

        await waitFor(() => {
            expect(screen.queryByText(/relatório gerado com sucesso/i)).not.toBeInTheDocument();
        });
    });

    it('deve tolerar lista de funcionarios nula', async () => {
        listarFuncionariosElegiveisEmissaoRelatorio.mockResolvedValue(null);
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });
    });

    it('deve ignorar preview apos desmontar durante carregamento', async () => {
        const usuario = userEvent.setup();
        let resolver;
        buscarPreviewRelatorioEntregaEpi.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        );

        const view = renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.type(screen.getByLabelText(/período início/i), '2026-01-01');
        await usuario.type(screen.getByLabelText(/período fim/i), '2026-01-31');
        await vi.advanceTimersByTimeAsync(400);

        view.unmount();
        resolver({
            textoPeriodoReferencia: '01/01/2026 a 31/01/2026',
            employee: { name: 'Ana Silva', roleName: 'Soldador' },
            entregas: []
        });

        await vi.advanceTimersByTimeAsync(100);
    });

    it('deve exibir erro generico ao falhar carregamento de funcionarios', async () => {
        listarFuncionariosElegiveisEmissaoRelatorio.mockRejectedValue(new Error());
        renderizarPagina();

        expect(
            await screen.findByText(/não foi possível carregar os funcionários/i)
        ).toBeInTheDocument();
    });

    it('deve limpar sucesso via callback do feedback', async () => {
        const usuario = userEvent.setup();
        const original = (await import('../../../shared/components/MensagemFeedback.jsx'))
            .AreaMensagensFeedback;
        const MensagemFeedback = await import('../../../shared/components/MensagemFeedback.jsx');
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.sucesso && props.onLimparSucesso) {
                props.onLimparSucesso();
            }

            return original(props);
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/funcionário/i)).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText(/funcionário/i), 'f1');
        await usuario.type(screen.getByLabelText(/período início/i), '2026-01-01');
        await usuario.type(screen.getByLabelText(/período fim/i), '2026-01-31');
        await vi.advanceTimersByTimeAsync(400);
        await usuario.click(screen.getByRole('button', { name: /gerar relatório/i }));

        await waitFor(() => {
            expect(screen.queryByText(/relatório gerado com sucesso/i)).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });

    it('deve limpar erro via callback do feedback', async () => {
        const usuario = userEvent.setup();
        const original = (await import('../../../shared/components/MensagemFeedback.jsx'))
            .AreaMensagensFeedback;
        const MensagemFeedback = await import('../../../shared/components/MensagemFeedback.jsx');
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.erro && props.onLimparErro) {
                props.onLimparErro();
            }

            return original(props);
        });

        listarFuncionariosElegiveisEmissaoRelatorio.mockRejectedValue(new Error('Falha temporária'));
        renderizarPagina();

        await waitFor(() => {
            expect(screen.queryByText('Falha temporária')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });
});
