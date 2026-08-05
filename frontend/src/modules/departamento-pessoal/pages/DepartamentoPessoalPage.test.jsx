import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { DepartamentoPessoalPage } from './DepartamentoPessoalPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: () => ({ token: 'jwt' })
}));

let searchParams = new URLSearchParams();
const setSearchParams = vi.fn((params) => {
    searchParams = new URLSearchParams(params);
});

vi.mock('react-router-dom', async () => {
    const atual = await vi.importActual('react-router-dom');
    return {
        ...atual,
        useSearchParams: () => [searchParams, setSearchParams]
    };
});

vi.mock('../../funcionarios/services/empresasApi.js', () => ({
    listarEmpresas: vi.fn()
}));

vi.mock('../../funcionarios/services/funcionariosApi.js', () => ({
    consultarFuncionarios: vi.fn(),
    listarFeriasFuncionarios: vi.fn(),
    baixarRelatorioFuncionarios: vi.fn()
}));

const { listarEmpresas } = await import('../../funcionarios/services/empresasApi.js');
const { consultarFuncionarios, listarFeriasFuncionarios } = await import(
    '../../funcionarios/services/funcionariosApi.js'
);

describe('DepartamentoPessoalPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        searchParams = new URLSearchParams();
        listarEmpresas.mockResolvedValue([{ id: 'emp-1', name: 'CVF', isActive: true }]);
        consultarFuncionarios.mockResolvedValue([
            {
                id: '1',
                name: 'Ana',
                cpf: '123',
                status: 'ATIVO',
                company: { name: 'CVF' }
            }
        ]);
        listarFeriasFuncionarios.mockResolvedValue({
            items: [
                {
                    id: '2',
                    name: 'Bruno',
                    cpf: '456',
                    status: 'FERIAS',
                    leaveReturnDate: '2026-08-01',
                    company: { name: 'CVF' }
                }
            ],
            total: 1,
            page: 1,
            pageSize: 25
        });
    });

    it('deve exibir painel de funcionários por padrão', async () => {
        render(
            <MemoryRouter>
                <DepartamentoPessoalPage />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: 'Departamento Pessoal' })).toBeInTheDocument();
        expect(await screen.findByText('Ana')).toBeInTheDocument();
    });

    it('deve trocar para painel de férias', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <DepartamentoPessoalPage />
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('button', { name: 'Férias' }));

        expect(await screen.findByText('Bruno')).toBeInTheDocument();
    });

    it('deve respeitar secao valida na url', async () => {
        searchParams = new URLSearchParams({ secao: 'ferias' });

        const { rerender } = render(
            <MemoryRouter>
                <DepartamentoPessoalPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Bruno')).toBeInTheDocument();
        });

        searchParams = new URLSearchParams({ secao: 'funcionarios' });
        rerender(
            <MemoryRouter>
                <DepartamentoPessoalPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });
    });
});
