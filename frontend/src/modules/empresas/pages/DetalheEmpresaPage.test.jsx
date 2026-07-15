import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { DetalheEmpresaPage } from './DetalheEmpresaPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../../shared/components/MensagemFeedback.jsx', () => ({
    AreaMensagensFeedback: ({
        erro = '',
        aviso = '',
        onLimparErro,
        onLimparAviso
    }) => {
        if (!erro && !aviso) {
            return null;
        }

        return (
            <div>
                {erro ? <p role="alert">{erro}</p> : null}
                {aviso ? <p role="status" className="mensagem mensagem--aviso">{aviso}</p> : null}
                {onLimparErro ? (
                    <button type="button" onClick={onLimparErro}>
                        limpar-erro
                    </button>
                ) : null}
                {onLimparAviso ? (
                    <button type="button" onClick={onLimparAviso}>
                        limpar-aviso
                    </button>
                ) : null}
            </div>
        );
    }
}));

vi.mock('../services/empresasApi.js', () => ({
    buscarEmpresaPorId: vi.fn(),
    atualizarEmpresa: vi.fn(),
    excluirEmpresa: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { buscarEmpresaPorId, atualizarEmpresa, excluirEmpresa } = await import('../services/empresasApi.js');

function renderizarPagina(id = 'empresa-1') {
    return render(
        <MemoryRouter initialEntries={[`/admin/empresas/${id}`]}>
            <Routes>
                <Route path="/admin/empresas/:id" element={<DetalheEmpresaPage />} />
                <Route path="/admin/empresas" element={<p>Lista de empresas</p>} />
            </Routes>
        </MemoryRouter>
    );
}

const empresaAtiva = {
    id: 'empresa-1',
    name: 'Empresa 01',
    cnpj: '12.345.678/0001-99',
    isActive: true
};

describe('DetalheEmpresaPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            token: 'jwt',
            user: { role: 'ADMINISTRATIVO' }
        });
    });

    it('nao deve permitir editar empresa inativa', async () => {
        buscarEmpresaPorId.mockResolvedValue({
            ...empresaAtiva,
            isActive: false
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /empresa 01/i })).toBeInTheDocument();
        });

        expect(
            screen.getByText(/esta empresa está inativa e não pode ser editada/i)
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/nome da empresa/i)).toBeDisabled();
        expect(screen.queryByRole('button', { name: /salvar alterações/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /excluir empresa/i })).not.toBeInTheDocument();
    });

    it('deve exibir acoes de edicao e exclusao para empresa ativa', async () => {
        buscarEmpresaPorId.mockResolvedValue(empresaAtiva);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /excluir empresa/i })).toBeEnabled();
        expect(screen.getByLabelText(/nome da empresa/i)).not.toBeDisabled();
    });

    it('nao deve exibir exclusao para papel sem permissao', async () => {
        useAuth.mockReturnValue({
            token: 'jwt',
            user: { role: 'COLABORADOR' }
        });
        buscarEmpresaPorId.mockResolvedValue(empresaAtiva);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        });

        expect(screen.queryByRole('button', { name: /excluir empresa/i })).not.toBeInTheDocument();
    });

    it('deve salvar alteracoes da empresa', async () => {
        const usuario = userEvent.setup();
        buscarEmpresaPorId.mockResolvedValue(empresaAtiva);
        atualizarEmpresa.mockResolvedValue({
            ...empresaAtiva,
            name: 'Empresa Atualizada'
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome da empresa/i)).toBeInTheDocument();
        });

        await usuario.clear(screen.getByLabelText(/nome da empresa/i));
        await usuario.type(screen.getByLabelText(/nome da empresa/i), 'Empresa Atualizada');
        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        await waitFor(() => {
            expect(atualizarEmpresa).toHaveBeenCalledWith(
                'empresa-1',
                expect.objectContaining({ name: 'Empresa Atualizada' }),
                'jwt'
            );
        });
    });

    it('deve exibir erro ao falhar salvamento', async () => {
        const usuario = userEvent.setup();
        buscarEmpresaPorId.mockResolvedValue(empresaAtiva);
        atualizarEmpresa.mockRejectedValue(new Error('CNPJ inválido.'));

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        expect((await screen.findAllByText('CNPJ inválido.')).length).toBeGreaterThan(0);
    });

    it('deve exibir erro generico ao falhar salvamento', async () => {
        const usuario = userEvent.setup();
        buscarEmpresaPorId.mockResolvedValue(empresaAtiva);
        atualizarEmpresa.mockRejectedValue(new Error());

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        expect(await screen.findByText('Não foi possível salvar as alterações.')).toBeInTheDocument();
    });

    it('deve exibir aviso quando exclusao for bloqueada por funcionarios vinculados', async () => {
        const usuario = userEvent.setup();
        buscarEmpresaPorId.mockResolvedValue(empresaAtiva);

        const erroBloqueio = new Error(
            'Não é possível excluir esta empresa enquanto houver funcionários vinculados a ela.'
        );
        erroBloqueio.statusCode = 409;
        excluirEmpresa.mockRejectedValue(erroBloqueio);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /excluir empresa/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /excluir empresa/i }));
        await usuario.click(screen.getAllByRole('button', { name: /excluir empresa/i })[1]);

        expect(
            await screen.findByText(
                /não é possível excluir esta empresa enquanto houver funcionários vinculados a ela/i
            )
        ).toHaveClass('mensagem--aviso');
    });

    it('deve exibir aviso generico quando exclusao retornar 409 sem mensagem', async () => {
        const usuario = userEvent.setup();
        buscarEmpresaPorId.mockResolvedValue(empresaAtiva);

        const erroBloqueio = new Error();
        erroBloqueio.statusCode = 409;
        excluirEmpresa.mockRejectedValue(erroBloqueio);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /excluir empresa/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /excluir empresa/i }));
        await usuario.click(screen.getAllByRole('button', { name: /excluir empresa/i })[1]);

        expect(
            await screen.findByText(
                /não é possível excluir esta empresa enquanto houver funcionários vinculados a ela/i
            )
        ).toHaveClass('mensagem--aviso');
    });

    it('deve excluir empresa e navegar para listagem', async () => {
        const usuario = userEvent.setup();
        buscarEmpresaPorId.mockResolvedValue(empresaAtiva);
        excluirEmpresa.mockResolvedValue(undefined);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /excluir empresa/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /excluir empresa/i }));
        await usuario.click(screen.getAllByRole('button', { name: /excluir empresa/i })[1]);

        await waitFor(() => {
            expect(screen.getByText('Lista de empresas')).toBeInTheDocument();
        });
    });

    it('deve exibir erro generico ao falhar exclusao', async () => {
        const usuario = userEvent.setup();
        buscarEmpresaPorId.mockResolvedValue(empresaAtiva);
        excluirEmpresa.mockRejectedValue(new Error());

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /excluir empresa/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /excluir empresa/i }));
        await usuario.click(screen.getAllByRole('button', { name: /excluir empresa/i })[1]);

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível excluir a empresa.'
        );
    });

    it('deve cancelar dialogo de exclusao', async () => {
        const usuario = userEvent.setup();
        buscarEmpresaPorId.mockResolvedValue(empresaAtiva);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /excluir empresa/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /excluir empresa/i }));
        await usuario.click(screen.getByRole('button', { name: /cancelar/i }));

        expect(excluirEmpresa).not.toHaveBeenCalled();
    });

    it('deve exibir erro quando empresa nao for encontrada', async () => {
        buscarEmpresaPorId.mockRejectedValue(new Error('Empresa não encontrada.'));

        renderizarPagina();

        expect(await screen.findByRole('alert')).toHaveTextContent(/empresa não encontrada/i);
        expect(screen.getByRole('link', { name: /voltar às empresas/i })).toBeInTheDocument();
    });

    it('deve exibir mensagem padrao quando empresa nao for encontrada sem erro', async () => {
        buscarEmpresaPorId.mockRejectedValue(new Error());

        renderizarPagina();

        expect(await screen.findByRole('alert')).toHaveTextContent('Empresa não encontrada.');
    });

    it('deve exibir fallback quando empresa retornar nula', async () => {
        buscarEmpresaPorId.mockResolvedValue(null);

        renderizarPagina();

        expect(await screen.findByRole('alert')).toHaveTextContent('Empresa não encontrada.');
    });

    it('deve tratar empresa com campos vazios', async () => {
        buscarEmpresaPorId.mockResolvedValue({
            id: 'empresa-1',
            name: null,
            cnpj: null,
            isActive: true
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome da empresa/i)).toHaveValue('');
            expect(screen.getByLabelText(/cnpj/i)).toHaveValue('');
        });
    });

    it('deve limpar erro de exclusao', async () => {
        const usuario = userEvent.setup();
        buscarEmpresaPorId.mockResolvedValue(empresaAtiva);
        excluirEmpresa.mockRejectedValue(new Error('Erro ao excluir.'));

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /excluir empresa/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /excluir empresa/i }));
        await usuario.click(screen.getAllByRole('button', { name: /excluir empresa/i })[1]);
        await usuario.click(screen.getByRole('button', { name: 'limpar-erro' }));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    it('deve limpar mensagens de feedback', async () => {
        const usuario = userEvent.setup();
        buscarEmpresaPorId.mockResolvedValue(empresaAtiva);

        const erroBloqueio = new Error();
        erroBloqueio.statusCode = 409;
        excluirEmpresa.mockRejectedValue(erroBloqueio);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /excluir empresa/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /excluir empresa/i }));
        await usuario.click(screen.getAllByRole('button', { name: /excluir empresa/i })[1]);

        expect(
            await screen.findByText(
                /não é possível excluir esta empresa enquanto houver funcionários vinculados a ela/i
            )
        ).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: 'limpar-aviso' }));

        await waitFor(() => {
            expect(
                screen.queryByText(
                    /não é possível excluir esta empresa enquanto houver funcionários vinculados a ela/i
                )
            ).not.toBeInTheDocument();
        });
    });
});
