import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { DetalheVagaAdminPage } from './DetalheVagaAdminPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../components/FormularioVaga.jsx', () => ({
    FormularioVaga: ({ onSubmit, exibirBotaoSalvar = true }) => (
        <div>
            {exibirBotaoSalvar ? (
                <button type="button" onClick={() => onSubmit({ tituloVaga: 'Nova vaga teste' })}>
                    Salvar vaga
                </button>
            ) : (
                <p>Formulário somente leitura</p>
            )}
            <button
                type="button"
                onClick={() => onSubmit({ tituloVaga: 'Vaga atualizada via edicao' })}
            >
                Salvar edicao interna
            </button>
        </div>
    )
}));

vi.mock('../services/recrutamentoApi.js', () => ({
    criarVaga: vi.fn(),
    atualizarVaga: vi.fn(),
    obterVagaAdmin: vi.fn(),
    atualizarStatusVaga: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { criarVaga, atualizarVaga, obterVagaAdmin, atualizarStatusVaga } = await import(
    '../services/recrutamentoApi.js'
);

function renderizarPagina(id = 'nova') {
    return render(
        <MemoryRouter initialEntries={[`/admin/recrutamento/${id}`]}>
            <Routes>
                <Route path="/admin/recrutamento/:id" element={<DetalheVagaAdminPage />} />
                <Route path="/admin/recrutamento/v1" element={<p>Detalhe v1</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('DetalheVagaAdminPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
    });

    it('deve renderizar modo criacao sem chamar APIs de vaga ou candidaturas', async () => {
        renderizarPagina('nova');

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /nova vaga/i })).toBeInTheDocument();
        });

        expect(obterVagaAdmin).not.toHaveBeenCalled();
    });

    it('deve chamar criarVaga ao salvar em modo criacao', async () => {
        const usuario = userEvent.setup();
        criarVaga.mockResolvedValue({ id: 'v1' });

        renderizarPagina('nova');

        await usuario.click(screen.getByRole('button', { name: /salvar vaga/i }));

        await waitFor(() => {
            expect(criarVaga).toHaveBeenCalledWith({ tituloVaga: 'Nova vaga teste' }, 'jwt');
        });

        expect(atualizarVaga).not.toHaveBeenCalled();
    });

    it('nao deve exibir salvar vaga ao editar vaga existente', async () => {
        obterVagaAdmin.mockResolvedValue({
            id: 'vaga-1',
            tituloVaga: 'Analista',
            status: 'ATIVA'
        });

        renderizarPagina('vaga-1');

        await waitFor(() => {
            expect(screen.getByText('Formulário somente leitura')).toBeInTheDocument();
        });

        expect(screen.queryByRole('button', { name: /salvar vaga/i })).not.toBeInTheDocument();
        expect(obterVagaAdmin).toHaveBeenCalledWith('vaga-1', 'jwt');
    });

    it('deve exibir erro generico ao falhar carregamento da vaga', async () => {
        obterVagaAdmin.mockRejectedValue(new Error());

        renderizarPagina('vaga-1');

        expect(await screen.findByText(/não foi possível carregar a vaga/i)).toBeInTheDocument();
    });

    it('deve exibir erro customizado ao falhar carregamento da vaga', async () => {
        obterVagaAdmin.mockRejectedValue(new Error('Vaga removida'));

        renderizarPagina('vaga-2');

        expect(await screen.findByText('Vaga removida')).toBeInTheDocument();
    });

    it('deve atualizar vaga existente pelo formulario e exibir erro generico ao falhar', async () => {
        const usuario = userEvent.setup();
        obterVagaAdmin.mockResolvedValue({ id: 'vaga-1', tituloVaga: 'Analista', status: 'ATIVA' });
        atualizarVaga.mockResolvedValue({ id: 'vaga-1', tituloVaga: 'Vaga atualizada via edicao', status: 'ATIVA' });

        renderizarPagina('vaga-1');

        await waitFor(() => {
            expect(screen.getByText('Formulário somente leitura')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /salvar edicao interna/i }));

        await waitFor(() => {
            expect(atualizarVaga).toHaveBeenCalledWith(
                'vaga-1',
                { tituloVaga: 'Vaga atualizada via edicao' },
                'jwt'
            );
        });

        expect(await screen.findByText(/vaga atualizada com sucesso/i)).toBeInTheDocument();

        atualizarVaga.mockRejectedValue(new Error());
        await usuario.click(screen.getByRole('button', { name: /salvar edicao interna/i }));

        expect(await screen.findByText(/não foi possível salvar a vaga/i)).toBeInTheDocument();
    });

    it('deve publicar vaga em rascunho com sucesso', async () => {
        const usuario = userEvent.setup();
        obterVagaAdmin.mockResolvedValue({ id: 'vaga-1', tituloVaga: 'Analista', status: 'INATIVA' });
        atualizarStatusVaga.mockResolvedValue({ id: 'vaga-1', tituloVaga: 'Analista', status: 'ATIVA' });

        renderizarPagina('vaga-1');

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /publicar vaga/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /publicar vaga/i }));

        await waitFor(() => {
            expect(atualizarStatusVaga).toHaveBeenCalledWith('vaga-1', 'ATIVA', 'jwt');
        });

        expect(await screen.findByText(/status da vaga alterado para ativa/i)).toBeInTheDocument();
        expect(await screen.findByRole('button', { name: /encerrar vaga/i })).toBeInTheDocument();
    });

    it('deve encerrar vaga ativa e exibir erro generico ao falhar', async () => {
        const usuario = userEvent.setup();
        obterVagaAdmin.mockResolvedValue({ id: 'vaga-1', tituloVaga: 'Analista', status: 'ATIVA' });
        atualizarStatusVaga.mockRejectedValue(new Error());

        renderizarPagina('vaga-1');

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /encerrar vaga/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /encerrar vaga/i }));

        expect(
            await screen.findByText(/não foi possível alterar o status da vaga/i)
        ).toBeInTheDocument();

        atualizarStatusVaga.mockResolvedValue({ id: 'vaga-1', tituloVaga: 'Analista', status: 'ENCERRADA' });
        await usuario.click(screen.getByRole('button', { name: /encerrar vaga/i }));

        await waitFor(() => {
            expect(atualizarStatusVaga).toHaveBeenCalledWith('vaga-1', 'ENCERRADA', 'jwt');
        });
    });

    it('deve invocar callbacks de limpeza das mensagens de feedback em modo criacao', async () => {
        const MensagemFeedbackModule = await import(
            '../../../shared/components/MensagemFeedback.jsx'
        );
        const original = MensagemFeedbackModule.AreaMensagensFeedback;
        const spy = vi
            .spyOn(MensagemFeedbackModule, 'AreaMensagensFeedback')
            .mockImplementation((props) => {
                props.onLimparErro?.();
                props.onLimparSucesso?.();
                props.onLimparAviso?.();
                return original(props);
            });

        renderizarPagina('nova');

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /nova vaga/i })).toBeInTheDocument();
        });

        spy.mockRestore();
    });

    it('deve invocar callbacks de limpeza das mensagens de feedback ao editar vaga', async () => {
        obterVagaAdmin.mockResolvedValue({ id: 'vaga-1', tituloVaga: 'Analista', status: 'ATIVA' });

        const MensagemFeedbackModule = await import(
            '../../../shared/components/MensagemFeedback.jsx'
        );
        const original = MensagemFeedbackModule.AreaMensagensFeedback;
        const spy = vi
            .spyOn(MensagemFeedbackModule, 'AreaMensagensFeedback')
            .mockImplementation((props) => {
                props.onLimparErro?.();
                props.onLimparSucesso?.();
                props.onLimparAviso?.();
                return original(props);
            });

        renderizarPagina('vaga-1');

        await waitFor(() => {
            expect(screen.getByText('Formulário somente leitura')).toBeInTheDocument();
        });

        spy.mockRestore();
    });
});
