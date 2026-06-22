import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NoticiasPage } from './NoticiasPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('react-router-dom', async () => {
    const atual = await vi.importActual('react-router-dom');
    return {
        ...atual,
        useSearchParams: () => [new URLSearchParams(), vi.fn()]
    };
});

vi.mock('../services/noticiasApi.js', () => ({
    listarAniversariantesNoticias: vi.fn(),
    listarAfastamentosNoticias: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarAniversariantesNoticias, listarAfastamentosNoticias } = await import(
    '../services/noticiasApi.js'
);

describe('NoticiasPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarAniversariantesNoticias.mockResolvedValue({
            mesReferencia: 'junho de 2025',
            aniversariantesPessoais: [
                {
                    id: '1',
                    nome: 'Ana',
                    empresa: 'Empresa A',
                    dataAniversario: '21/06'
                }
            ],
            aniversariantesEmpresa: [
                {
                    id: '2',
                    nome: 'Bruno',
                    empresa: 'Empresa B',
                    tempoEmpresa: '5 anos'
                }
            ]
        });
        listarAfastamentosNoticias.mockResolvedValue({
            mesReferencia: 'junho de 2025',
            saindo: [
                {
                    id: '3',
                    nome: 'Carla',
                    empresa: 'Empresa C',
                    situacao: 'Férias',
                    previsaoRetorno: '10/08/2026'
                }
            ],
            voltando: [
                {
                    id: '4',
                    nome: 'Diego',
                    empresa: 'Empresa D',
                    situacao: 'Licença médica',
                    dataRetorno: '28/06/2026'
                }
            ]
        });
    });

    it('deve exibir aba de aniversário com tabelas pessoais e de empresa', async () => {
        render(<NoticiasPage />);

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /aniversário/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /afastamento/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /aniversariantes pessoais/i })).toBeInTheDocument();
        expect(screen.getByText('Bruno')).toBeInTheDocument();
    });

    it('deve exibir tabelas de afastamento na segunda aba', async () => {
        const usuario = userEvent.setup();
        render(<NoticiasPage />);

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /afastamento/i }));

        await waitFor(() => {
            expect(screen.getByText('Carla')).toBeInTheDocument();
        });

        expect(listarAfastamentosNoticias).toHaveBeenCalled();
        expect(screen.getByRole('heading', { name: /quem está saindo/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /quem está voltando/i })).toBeInTheDocument();
        expect(screen.getByText('Diego')).toBeInTheDocument();
    });
});
