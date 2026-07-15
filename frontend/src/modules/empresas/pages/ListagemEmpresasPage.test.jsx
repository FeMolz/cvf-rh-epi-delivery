import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { ListagemEmpresasPage } from './ListagemEmpresasPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../../shared/components/MensagemFeedback.jsx', () => ({
    AreaMensagensFeedback: ({ erro = '', onLimparErro }) =>
        erro ? (
            <div>
                <p role="alert">{erro}</p>
                <button type="button" onClick={onLimparErro}>
                    limpar-erro
                </button>
            </div>
        ) : null
}));

vi.mock('../services/empresasApi.js', () => ({
    listarEmpresas: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarEmpresas } = await import('../services/empresasApi.js');

function criarEmpresas(quantidade, prefixo = 'Empresa', ativas = true) {
    return Array.from({ length: quantidade }, (_, indice) => ({
        id: String(indice + 1),
        name: `${prefixo} ${indice + 1}`,
        cnpj: `12.345.678/000${String(indice + 1).padStart(2, '0')}-99`,
        isActive: ativas
    }));
}

describe('ListagemEmpresasPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarEmpresas.mockResolvedValue([
            {
                id: '1',
                name: 'Empresa 01',
                cnpj: '12.345.678/0001-99',
                isActive: true
            }
        ]);
    });

    it('deve exibir empresas ativas', async () => {
        render(
            <MemoryRouter>
                <ListagemEmpresasPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Empresa 01')).toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: /^empresas$/i })).toBeInTheDocument();
        expect(screen.getByText('12.345.678/0001-99')).toBeInTheDocument();
    });

    it('deve paginar, pesquisar e trocar aba', async () => {
        const usuario = userEvent.setup();
        listarEmpresas.mockResolvedValue([
            ...criarEmpresas(12),
            ...criarEmpresas(1, 'Inativa', false)
        ]);

        render(
            <MemoryRouter>
                <ListagemEmpresasPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Empresa 1')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        expect(screen.getByText('Empresa 11')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /anterior/i }));
        expect(screen.getByText('Empresa 1')).toBeInTheDocument();

        await usuario.type(screen.getByPlaceholderText(/buscar por nome ou cnpj/i), 'Empresa 2');
        expect(screen.getByText('Empresa 2')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /inativas/i }));

        await waitFor(() => {
            expect(screen.getByText('Inativa 1')).toBeInTheDocument();
            expect(screen.getByText('Empresas inativas')).toBeInTheDocument();
        });
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        listarEmpresas.mockRejectedValue(new Error('Falha ao carregar'));

        render(
            <MemoryRouter>
                <ListagemEmpresasPage />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao carregar');
    });

    it('deve exibir erro generico sem mensagem', async () => {
        listarEmpresas.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <ListagemEmpresasPage />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível carregar as empresas.'
        );
    });

    it('deve limpar mensagem de erro', async () => {
        const usuario = userEvent.setup();
        listarEmpresas.mockRejectedValue(new Error('Falha ao carregar'));

        render(
            <MemoryRouter>
                <ListagemEmpresasPage />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao carregar');
        await usuario.click(screen.getByRole('button', { name: 'limpar-erro' }));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });
});
