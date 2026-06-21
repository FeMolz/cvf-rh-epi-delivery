import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { NoticiasPage } from './NoticiasPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/noticiasApi.js', () => ({
    listarAniversariantesNoticias: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarAniversariantesNoticias } = await import('../services/noticiasApi.js');

describe('NoticiasPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
    });

    it('deve exibir tabelas de aniversariantes lado a lado', async () => {
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

        render(<NoticiasPage />);

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: /notícias/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /aniversariantes pessoais/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /aniversariantes de tempo de empresa/i })).toBeInTheDocument();
        expect(screen.getByText('Bruno')).toBeInTheDocument();
        expect(screen.getByText('5 anos')).toBeInTheDocument();
    });
});
