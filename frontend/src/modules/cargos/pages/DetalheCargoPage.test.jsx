import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import * as MensagemFeedback from '../../../shared/components/MensagemFeedback.jsx';
import { DetalheCargoPage } from './DetalheCargoPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/cargosApi.js', () => ({
    buscarCargoPorId: vi.fn(),
    atualizarCargo: vi.fn(),
    alterarSituacaoCargo: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { buscarCargoPorId, alterarSituacaoCargo, atualizarCargo } = await import('../services/cargosApi.js');

function renderizarPagina(id = 'cargo-1') {
    return render(
        <MemoryRouter initialEntries={[`/admin/cargos/${id}`]}>
            <Routes>
                <Route path="/admin/cargos/:id" element={<DetalheCargoPage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('DetalheCargoPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            token: 'jwt',
            user: { role: 'ADMINISTRATIVO' }
        });
    });

    it('nao deve permitir editar cargo inativo, mas deve permitir reativar', async () => {
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: '2024-06-15T12:00:00.000Z',
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-06-15T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /operador/i })).toBeInTheDocument();
        });

        expect(screen.getByText(/este cargo está inativo e não pode ser editado/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/nome do cargo/i)).toBeDisabled();
        expect(screen.queryByRole('button', { name: /salvar alterações/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reativar cargo/i })).toBeInTheDocument();
    });

    it('deve exibir acoes de edicao e desativacao para cargo ativo sem funcionarios', async () => {
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 2, employees: 0 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /desativar cargo/i })).toBeEnabled();
        expect(screen.getByLabelText(/nome do cargo/i)).not.toBeDisabled();
    });

    it('deve desabilitar desativacao quando cargo ativo possui funcionarios vinculados', async () => {
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 2 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /desativar cargo/i })).toBeDisabled();
        });

        expect(
            screen.getByText(/altere o cargo de cada funcionário antes de desativá-lo/i)
        ).toBeInTheDocument();
    });

    it('deve exibir aviso quando desativacao for bloqueada por funcionarios vinculados', async () => {
        const usuario = userEvent.setup();

        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        const erroBloqueio = new Error(
            'Não é possível desativar este cargo enquanto houver funcionários cadastrados nele. Altere o cargo dos funcionários antes de continuar.'
        );
        erroBloqueio.statusCode = 409;
        alterarSituacaoCargo.mockRejectedValue(erroBloqueio);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /desativar cargo/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /desativar cargo/i }));
        await usuario.click(screen.getAllByRole('button', { name: /desativar cargo/i })[1]);

        expect(
            await screen.findByText(
                /não é possível desativar este cargo enquanto houver funcionários cadastrados nele/i
            )
        ).toHaveClass('mensagem--aviso');
    });

    it('deve salvar alteracoes do cargo ativo', async () => {
        const usuario = userEvent.setup();
        atualizarCargo.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador Senior',
            description: 'Linha 2',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-06-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome do cargo/i)).toBeInTheDocument();
        });

        await usuario.clear(screen.getByLabelText(/nome do cargo/i));
        await usuario.type(screen.getByLabelText(/nome do cargo/i), 'Operador Senior');
        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        await waitFor(() => {
            expect(atualizarCargo).toHaveBeenCalledWith(
                'cargo-1',
                expect.objectContaining({ name: 'Operador Senior' }),
                'jwt'
            );
        });
    });

    it('deve reativar cargo inativo e navegar apos desativar', async () => {
        const usuario = userEvent.setup();

        buscarCargoPorId
            .mockResolvedValueOnce({
                id: 'cargo-1',
                name: 'Operador',
                description: 'Linha de produção',
                deletedAt: '2024-06-15T12:00:00.000Z',
                createdAt: '2024-01-01T12:00:00.000Z',
                updatedAt: '2024-06-15T12:00:00.000Z',
                _count: { roleEpis: 0, employees: 0 }
            })
            .mockResolvedValueOnce({
                id: 'cargo-1',
                name: 'Operador',
                description: 'Linha de produção',
                deletedAt: null,
                createdAt: '2024-01-01T12:00:00.000Z',
                updatedAt: '2024-06-20T12:00:00.000Z',
                _count: { roleEpis: 0, employees: 0 }
            });

        alterarSituacaoCargo.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-06-20T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        const { unmount } = render(
            <MemoryRouter initialEntries={['/admin/cargos/cargo-1']}>
                <Routes>
                    <Route path="/admin/cargos/:id" element={<DetalheCargoPage />} />
                    <Route path="/admin/cargos" element={<p>Lista de cargos</p>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /reativar cargo/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /reativar cargo/i }));
        await usuario.click(screen.getAllByRole('button', { name: /reativar cargo/i })[1]);

        await waitFor(() => {
            expect(alterarSituacaoCargo).toHaveBeenCalledWith('cargo-1', true, 'jwt');
        });

        unmount();

        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });
        alterarSituacaoCargo.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: '2024-06-21T12:00:00.000Z',
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-06-21T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        render(
            <MemoryRouter initialEntries={['/admin/cargos/cargo-1']}>
                <Routes>
                    <Route path="/admin/cargos/:id" element={<DetalheCargoPage />} />
                    <Route path="/admin/cargos" element={<p>Lista de cargos</p>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /desativar cargo/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /desativar cargo/i }));
        await usuario.click(screen.getAllByRole('button', { name: /desativar cargo/i })[1]);

        await waitFor(() => {
            expect(screen.getByText('Lista de cargos')).toBeInTheDocument();
        });
    });

    it('deve exibir erro quando cargo nao for encontrado', async () => {
        buscarCargoPorId.mockRejectedValue(new Error('Cargo não encontrado.'));

        renderizarPagina();

        expect(await screen.findByRole('alert')).toHaveTextContent(/cargo não encontrado/i);
        expect(screen.getByRole('link', { name: /voltar aos cargos/i })).toBeInTheDocument();
    });

    it('deve cancelar dialogo de confirmacao', async () => {
        const usuario = userEvent.setup();
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /desativar cargo/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /desativar cargo/i }));
        await usuario.click(screen.getByRole('button', { name: /cancelar/i }));

        expect(alterarSituacaoCargo).not.toHaveBeenCalled();
    });

    it('deve exibir estado de carregamento', () => {
        buscarCargoPorId.mockImplementation(() => new Promise(() => {}));

        renderizarPagina();

        expect(screen.getByText(/carregando cargo/i)).toBeInTheDocument();
    });

    it('nao deve exibir acoes de situacao para usuario sem permissao', async () => {
        useAuth.mockReturnValue({
            token: 'jwt',
            user: { role: 'COLABORADOR' }
        });
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /operador/i })).toBeInTheDocument();
        });

        expect(screen.queryByRole('button', { name: /desativar cargo/i })).not.toBeInTheDocument();
    });

    it('deve exibir erro ao falhar salvamento', async () => {
        const usuario = userEvent.setup();
        atualizarCargo.mockRejectedValue(new Error('Erro ao salvar.'));
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome do cargo/i)).toBeInTheDocument();
        });

        await usuario.clear(screen.getByLabelText(/nome do cargo/i));
        await usuario.type(screen.getByLabelText(/nome do cargo/i), 'Operador Atualizado');
        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        await waitFor(() => {
            expect(atualizarCargo).toHaveBeenCalled();
        });

        await waitFor(() => {
            const alertas = screen.getAllByRole('alert');
            expect(alertas.some((alerta) => alerta.textContent.includes('Erro ao salvar.'))).toBe(
                true
            );
        });
    });

    it('deve exibir erro generico ao falhar alteracao de situacao', async () => {
        const usuario = userEvent.setup();
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });
        alterarSituacaoCargo.mockRejectedValue({});

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /desativar cargo/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /desativar cargo/i }));
        await usuario.click(screen.getAllByRole('button', { name: /desativar cargo/i })[1]);

        expect(await screen.findByText(/não foi possível desativar o cargo/i)).toBeInTheDocument();
    });

    it('deve exibir erro padrao ao falhar salvamento', async () => {
        const usuario = userEvent.setup();
        atualizarCargo.mockRejectedValue({});
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome do cargo/i)).toBeInTheDocument();
        });

        await usuario.clear(screen.getByLabelText(/nome do cargo/i));
        await usuario.type(screen.getByLabelText(/nome do cargo/i), 'Operador Atualizado');
        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        expect(await screen.findByText(/não foi possível salvar as alterações/i)).toBeInTheDocument();
    });

    it('deve exibir aviso padrao quando desativacao retornar 409 sem message', async () => {
        const usuario = userEvent.setup();
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        const erroBloqueio = new Error();
        erroBloqueio.statusCode = 409;
        alterarSituacaoCargo.mockRejectedValue(erroBloqueio);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /desativar cargo/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /desativar cargo/i }));
        await usuario.click(screen.getAllByRole('button', { name: /desativar cargo/i })[1]);

        expect(
            await screen.findByText(
                /não é possível desativar este cargo enquanto houver funcionários cadastrados nele/i
            )
        ).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar reativacao', async () => {
        const usuario = userEvent.setup();
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: '2024-06-15T12:00:00.000Z',
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-06-15T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });
        alterarSituacaoCargo.mockRejectedValue(new Error('Falha ao reativar.'));

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /reativar cargo/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /reativar cargo/i }));
        await usuario.click(screen.getAllByRole('button', { name: /reativar cargo/i })[1]);

        expect(await screen.findByText('Falha ao reativar.')).toBeInTheDocument();
    });

    it('deve limpar aviso via callback do feedback', async () => {
        const usuario = userEvent.setup();
        const original = MensagemFeedback.AreaMensagensFeedback;
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.aviso && props.onLimparAviso) {
                props.onLimparAviso();
            }

            return original(props);
        });

        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        const erroBloqueio = new Error('Bloqueio por funcionários.');
        erroBloqueio.statusCode = 409;
        alterarSituacaoCargo.mockRejectedValue(erroBloqueio);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /desativar cargo/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /desativar cargo/i }));
        await usuario.click(screen.getAllByRole('button', { name: /desativar cargo/i })[1]);

        await waitFor(() => {
            expect(screen.queryByText('Bloqueio por funcionários.')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });

    it('deve limpar erro via callback do feedback', async () => {
        const usuario = userEvent.setup();
        const original = MensagemFeedback.AreaMensagensFeedback;
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.erro && props.onLimparErro) {
                props.onLimparErro();
            }

            return original(props);
        });

        atualizarCargo.mockRejectedValue(new Error('Erro ao salvar.'));
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome do cargo/i)).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });

    it('nao deve atualizar estado apos desmontar durante carregamento', async () => {
        let resolver;
        buscarCargoPorId.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        );

        const { unmount } = renderizarPagina();

        unmount();

        resolver({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha',
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        await act(async () => {
            await Promise.resolve();
        });
    });

    it('deve exibir mensagem padrao quando busca falhar sem message', async () => {
        buscarCargoPorId.mockRejectedValue({});

        renderizarPagina();

        expect(await screen.findByText(/cargo não encontrado/i)).toBeInTheDocument();
    });

    it('deve exibir mensagem padrao quando cargo retornar vazio', async () => {
        buscarCargoPorId.mockResolvedValue(null);

        renderizarPagina();

        expect(await screen.findByText(/cargo não encontrado/i)).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar reativacao sem message', async () => {
        const usuario = userEvent.setup();
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: 'Operador',
            description: 'Linha de produção',
            deletedAt: '2024-06-15T12:00:00.000Z',
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-06-15T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });
        alterarSituacaoCargo.mockRejectedValue({});

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /reativar cargo/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /reativar cargo/i }));
        await usuario.click(screen.getAllByRole('button', { name: /reativar cargo/i })[1]);

        expect(await screen.findByText(/não foi possível reativar o cargo/i)).toBeInTheDocument();
    });

    it('deve exibir cargo com nome e descricao vazios', async () => {
        buscarCargoPorId.mockResolvedValue({
            id: 'cargo-1',
            name: null,
            description: null,
            deletedAt: null,
            createdAt: '2024-01-01T12:00:00.000Z',
            updatedAt: '2024-01-01T12:00:00.000Z',
            _count: { roleEpis: 0, employees: 0 }
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome do cargo/i)).toHaveValue('');
        });

        expect(screen.getByLabelText(/descrição/i)).toHaveValue('');
    });
});
