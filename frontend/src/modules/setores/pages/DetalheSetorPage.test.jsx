import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { DetalheSetorPage } from './DetalheSetorPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/setoresApi.js', () => ({
    buscarSetorPorId: vi.fn(),
    atualizarSetor: vi.fn(),
    excluirSetor: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { buscarSetorPorId, atualizarSetor, excluirSetor } = await import('../services/setoresApi.js');

function renderizarPagina(id = 'setor-1') {
    return render(
        <MemoryRouter initialEntries={[`/admin/setores/${id}`]}>
            <Routes>
                <Route path="/admin/setores/:id" element={<DetalheSetorPage />} />
                <Route path="/admin/setores" element={<p>Lista de setores</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('DetalheSetorPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            token: 'jwt',
            user: { role: 'ADMINISTRATIVO' }
        });
    });

    it('nao deve permitir editar setor inativo', async () => {
        buscarSetorPorId.mockResolvedValue({
            id: 'setor-1',
            nome: 'ADMINISTRATIVO',
            isActive: false
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /administrativo/i })).toBeInTheDocument();
        });

        expect(
            screen.getByText(/este setor está inativo e não pode ser editado/i)
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/nome do setor/i)).toBeDisabled();
        expect(screen.queryByRole('button', { name: /salvar alterações/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /excluir setor/i })).not.toBeInTheDocument();
    });

    it('deve exibir acoes de edicao e exclusao para setor ativo', async () => {
        buscarSetorPorId.mockResolvedValue({
            id: 'setor-1',
            nome: 'ADMINISTRATIVO',
            isActive: true
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /excluir setor/i })).toBeEnabled();
        expect(screen.getByLabelText(/nome do setor/i)).not.toBeDisabled();
    });

    it('deve exibir aviso quando exclusao for bloqueada por funcionarios vinculados', async () => {
        const usuario = userEvent.setup();

        buscarSetorPorId.mockResolvedValue({
            id: 'setor-1',
            nome: 'ADMINISTRATIVO',
            isActive: true
        });

        const erroBloqueio = new Error(
            'Não é possível excluir este setor enquanto houver funcionários vinculados a ele.'
        );
        erroBloqueio.statusCode = 409;
        excluirSetor.mockRejectedValue(erroBloqueio);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /excluir setor/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /excluir setor/i }));
        await usuario.click(screen.getAllByRole('button', { name: /excluir setor/i })[1]);

        expect(
            await screen.findByText(
                /não é possível excluir este setor enquanto houver funcionários vinculados a ele/i
            )
        ).toHaveClass('mensagem--aviso');
    });

    it('deve exibir erro quando setor nao for encontrado', async () => {
        buscarSetorPorId.mockRejectedValue(new Error('Setor inexistente.'));

        renderizarPagina();

        expect(await screen.findByRole('alert')).toHaveTextContent('Setor inexistente.');
        expect(screen.getByRole('link', { name: /voltar aos setores/i })).toBeInTheDocument();
    });

    it('deve exibir erro generico ao carregar setor', async () => {
        buscarSetorPorId.mockRejectedValue(new Error());

        renderizarPagina();

        expect(await screen.findByRole('alert')).toHaveTextContent('Setor não encontrado.');
    });

    it('deve salvar alteracoes do setor', async () => {
        const usuario = userEvent.setup();

        buscarSetorPorId.mockResolvedValue({
            id: 'setor-1',
            nome: 'ADMINISTRATIVO',
            isActive: true
        });
        atualizarSetor.mockResolvedValue({
            id: 'setor-1',
            nome: 'Administrativo atualizado',
            isActive: true
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome do setor/i)).toBeInTheDocument();
        });

        await usuario.clear(screen.getByLabelText(/nome do setor/i));
        await usuario.type(screen.getByLabelText(/nome do setor/i), 'Administrativo atualizado');
        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        await waitFor(() => {
            expect(atualizarSetor).toHaveBeenCalledWith(
                'setor-1',
                { nome: 'ADMINISTRATIVO ATUALIZADO' },
                'jwt'
            );
        });
    });

    it('deve exibir erro ao falhar salvamento', async () => {
        const usuario = userEvent.setup();

        buscarSetorPorId.mockResolvedValue({
            id: 'setor-1',
            nome: 'ADMINISTRATIVO',
            isActive: true
        });
        atualizarSetor.mockRejectedValue(new Error('Falha ao salvar.'));

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        expect((await screen.findAllByText('Falha ao salvar.')).length).toBeGreaterThan(0);
    });

    it('deve excluir setor e redirecionar', async () => {
        const usuario = userEvent.setup();

        buscarSetorPorId.mockResolvedValue({
            id: 'setor-1',
            nome: 'ADMINISTRATIVO',
            isActive: true
        });
        excluirSetor.mockResolvedValue(undefined);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /excluir setor/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /excluir setor/i }));
        await usuario.click(screen.getAllByRole('button', { name: /excluir setor/i })[1]);

        await waitFor(() => {
            expect(excluirSetor).toHaveBeenCalledWith('setor-1', 'jwt');
            expect(screen.getByText('Lista de setores')).toBeInTheDocument();
        });
    });

    it('deve exibir erro generico ao falhar exclusao', async () => {
        const usuario = userEvent.setup();

        buscarSetorPorId.mockResolvedValue({
            id: 'setor-1',
            nome: 'ADMINISTRATIVO',
            isActive: true
        });
        excluirSetor.mockRejectedValue(new Error());

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /excluir setor/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /excluir setor/i }));
        await usuario.click(screen.getAllByRole('button', { name: /excluir setor/i })[1]);

        expect(await screen.findByText(/não foi possível excluir o setor/i)).toBeInTheDocument();
    });

    it('deve cancelar dialogo de exclusao', async () => {
        const usuario = userEvent.setup();

        buscarSetorPorId.mockResolvedValue({
            id: 'setor-1',
            nome: 'ADMINISTRATIVO',
            isActive: true
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /excluir setor/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /excluir setor/i }));
        await usuario.click(screen.getByRole('button', { name: /cancelar/i }));

        expect(screen.queryByText(/tem certeza que deseja excluir/i)).not.toBeInTheDocument();
        expect(excluirSetor).not.toHaveBeenCalled();
    });

    it('nao deve exibir exclusao para usuario sem permissao', async () => {
        useAuth.mockReturnValue({
            token: 'jwt',
            user: { role: 'ALMOXARIFADO' }
        });

        buscarSetorPorId.mockResolvedValue({
            id: 'setor-1',
            nome: 'ADMINISTRATIVO',
            isActive: true
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        });

        expect(screen.queryByRole('button', { name: /excluir setor/i })).not.toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar salvamento', async () => {
        const usuario = userEvent.setup();

        buscarSetorPorId.mockResolvedValue({
            id: 'setor-1',
            nome: 'ADMINISTRATIVO',
            isActive: true
        });
        atualizarSetor.mockRejectedValue(new Error());

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        expect((await screen.findAllByText(/não foi possível salvar as alterações/i)).length).toBeGreaterThan(
            0
        );
    });

    it('deve exibir aviso generico quando exclusao for bloqueada', async () => {
        const usuario = userEvent.setup();

        buscarSetorPorId.mockResolvedValue({
            id: 'setor-1',
            nome: 'ADMINISTRATIVO',
            isActive: true
        });

        const erroBloqueio = new Error();
        erroBloqueio.statusCode = 409;
        excluirSetor.mockRejectedValue(erroBloqueio);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /excluir setor/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /excluir setor/i }));
        await usuario.click(screen.getAllByRole('button', { name: /excluir setor/i })[1]);

        expect(
            await screen.findByText(
                /não é possível excluir este setor enquanto houver funcionários vinculados a ele/i
            )
        ).toBeInTheDocument();
    });

    it('deve limpar aviso automaticamente', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const usuario = userEvent.setup();

        buscarSetorPorId.mockResolvedValue({
            id: 'setor-1',
            nome: 'ADMINISTRATIVO',
            isActive: true
        });

        const erroBloqueio = new Error('Aviso temporário');
        erroBloqueio.statusCode = 409;
        excluirSetor.mockRejectedValue(erroBloqueio);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /excluir setor/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /excluir setor/i }));
        await usuario.click(screen.getAllByRole('button', { name: /excluir setor/i })[1]);

        expect(await screen.findByText('Aviso temporário')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        await waitFor(() => {
            expect(screen.queryByText('Aviso temporário')).not.toBeInTheDocument();
        });
        vi.useRealTimers();
    });

    it('deve limpar mensagem de erro automaticamente', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        buscarSetorPorId.mockResolvedValue({
            id: 'setor-1',
            nome: 'ADMINISTRATIVO',
            isActive: true
        });
        atualizarSetor.mockRejectedValue(new Error('Erro temporário'));

        const usuario = userEvent.setup();
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));
        expect((await screen.findAllByText('Erro temporário')).length).toBeGreaterThan(0);

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        await waitFor(() => {
            expect(screen.queryByText('Erro temporário')).not.toBeInTheDocument();
        });
        vi.useRealTimers();
    });

    it('deve exibir setor sem nome e mensagem padrao de erro', async () => {
        buscarSetorPorId.mockResolvedValue({
            id: 'setor-1',
            nome: null,
            isActive: true
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: '' })).toBeInTheDocument();
        });
    });

    it('deve exibir mensagem padrao quando setor nao existir sem erro', async () => {
        buscarSetorPorId.mockResolvedValue(null);

        renderizarPagina();

        expect(await screen.findByRole('alert')).toHaveTextContent('Setor não encontrado.');
    });
});
