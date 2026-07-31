import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { DetalheVagaPage } from './DetalheVagaPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn(() => ({ token: 'jwt', user: { name: 'Ana' }, logout: vi.fn() }))
}));

vi.mock('../services/recrutamentoApi.js', () => ({
    obterVagaAtiva: vi.fn(),
    candidatarSe: vi.fn()
}));

const { obterVagaAtiva, candidatarSe } = await import('../services/recrutamentoApi.js');

const vagaBase = {
    id: 'v1',
    tituloVaga: 'Analista RH',
    localTrabalho: 'São Paulo',
    modoTrabalho: 'PRESENCIAL',
    tipoContratacao: 'CLT',
    jornadaTrabalho: '40h',
    faixaSalarial: '5k',
    setor: { nome: 'RH' },
    apresentacaoEmpresa: 'Empresa',
    sobreVaga: 'Sobre',
    responsabilidades: 'Resp',
    requisitos: 'Req',
    beneficios: 'Ben',
    jaCandidatou: false
};

describe('DetalheVagaPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        obterVagaAtiva.mockResolvedValue(vagaBase);
        candidatarSe.mockResolvedValue({ id: 'c1' });
    });

    function renderPagina() {
        return render(
            <MemoryRouter initialEntries={['/vagas/v1']}>
                <Routes>
                    <Route path="/vagas/:id" element={<DetalheVagaPage />} />
                </Routes>
            </MemoryRouter>
        );
    }

    it('deve exibir vaga e enviar candidatura pelo modal', async () => {
        const usuario = userEvent.setup({ delay: null });

        renderPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /analista rh/i })).toBeInTheDocument();
        });

        expect(screen.getByText(/faixa salarial: 5k/i)).toBeInTheDocument();
        expect(screen.getByText(/setor: rh/i)).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /candidatar-se/i }));
        await usuario.type(screen.getByLabelText(/^telefone$/i), '11988887777');
        await usuario.click(screen.getByRole('button', { name: /confirmar candidatura/i }));

        await waitFor(() => {
            expect(candidatarSe).toHaveBeenCalled();
        });

        expect(screen.getByText(/candidatura enviada com sucesso/i)).toBeInTheDocument();
    });

    it('deve desabilitar candidatura quando ja candidatou', async () => {
        obterVagaAtiva.mockResolvedValue({ ...vagaBase, jaCandidatou: true });

        renderPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /você já se candidatou/i })).toBeDisabled();
        });
    });

    it('deve exibir erro quando vaga nao carregar', async () => {
        obterVagaAtiva.mockRejectedValue(new Error('Vaga indisponível'));

        renderPagina();

        await waitFor(() => {
            expect(screen.getByText(/vaga indisponível/i)).toBeInTheDocument();
        });
    });

    it('deve exibir fallback quando a api retornar vaga vazia sem erro', async () => {
        obterVagaAtiva.mockResolvedValue(null);

        renderPagina();

        await waitFor(() => {
            expect(screen.getByText(/vaga indisponível/i)).toBeInTheDocument();
        });
    });

    it('deve exibir erro generico ao falhar candidatura', async () => {
        const usuario = userEvent.setup({ delay: null });
        candidatarSe.mockRejectedValue(new Error(''));

        renderPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /candidatar-se/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /candidatar-se/i }));
        await usuario.click(screen.getByRole('button', { name: /confirmar candidatura/i }));

        await waitFor(() => {
            expect(screen.getByText(/não foi possível enviar a candidatura/i)).toBeInTheDocument();
        });
    });

    it('deve exibir mensagem padrao quando vaga nao carregar sem mensagem de erro', async () => {
        obterVagaAtiva.mockRejectedValue(new Error());

        renderPagina();

        await waitFor(() => {
            expect(screen.getByText(/não foi possível carregar a vaga/i)).toBeInTheDocument();
        });
    });

    it('nao deve exibir faixa salarial nem setor quando ausentes na vaga', async () => {
        obterVagaAtiva.mockResolvedValue({
            ...vagaBase,
            faixaSalarial: undefined,
            setor: undefined
        });

        renderPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /analista rh/i })).toBeInTheDocument();
        });

        expect(screen.queryByText(/faixa salarial:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/setor:/i)).not.toBeInTheDocument();
    });

    it('deve enviar candidatura com todos os campos opcionais preenchidos', async () => {
        const usuario = userEvent.setup({ delay: null });

        renderPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /analista rh/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /candidatar-se/i }));
        await usuario.type(screen.getByLabelText(/^telefone$/i), '11988887777');
        await usuario.type(screen.getByLabelText(/^cidade$/i), 'São Paulo');
        await usuario.type(screen.getByLabelText(/^estado$/i), 'SP');
        await usuario.type(screen.getByLabelText(/mensagem/i), 'Tenho muito interesse.');

        const arquivo = new File(['pdf'], 'curriculo.pdf', { type: 'application/pdf' });
        await usuario.upload(screen.getByLabelText(/currículo/i), arquivo);

        await usuario.click(screen.getByRole('button', { name: /confirmar candidatura/i }));

        await waitFor(() => {
            expect(candidatarSe).toHaveBeenCalled();
        });

        const formData = candidatarSe.mock.calls[0][1];
        expect(formData.get('cidade')).toBe('São Paulo');
        expect(formData.get('estado')).toBe('SP');
        expect(formData.get('mensagemCandidato')).toBe('Tenho muito interesse.');
        expect(formData.get('curriculo')).toBe(arquivo);
    });

    it('deve fechar o modal de candidatura ao cancelar', async () => {
        const usuario = userEvent.setup({ delay: null });

        renderPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /analista rh/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /candidatar-se/i }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /^cancelar$/i }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
