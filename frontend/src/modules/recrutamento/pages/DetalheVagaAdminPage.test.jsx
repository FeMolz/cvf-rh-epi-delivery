import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { DetalheVagaAdminPage } from './DetalheVagaAdminPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../components/FormularioVaga.jsx', () => ({
    FormularioVaga: ({ onSubmit, exibirBotaoSalvar = true }) =>
        exibirBotaoSalvar ? (
            <button type="button" onClick={() => onSubmit({ tituloVaga: 'Nova vaga teste' })}>
                Salvar vaga
            </button>
        ) : (
            <p>Formulário somente leitura</p>
        )
}));

vi.mock('../services/recrutamentoApi.js', () => ({
    criarVaga: vi.fn(),
    atualizarVaga: vi.fn(),
    obterVagaAdmin: vi.fn(),
    atualizarStatusVaga: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { criarVaga, atualizarVaga, obterVagaAdmin } = await import('../services/recrutamentoApi.js');

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
});
