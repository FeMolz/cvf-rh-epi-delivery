import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { NoticiasPage } from './NoticiasPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
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

vi.mock('../services/noticiasApi.js', () => ({
    listarAniversariantesNoticias: vi.fn(),
    listarAfastamentosNoticias: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarAniversariantesNoticias, listarAfastamentosNoticias } = await import(
    '../services/noticiasApi.js'
);

const dadosAniversario = {
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
};

const dadosAfastamento = {
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
};

describe('NoticiasPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        searchParams = new URLSearchParams();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarAniversariantesNoticias.mockResolvedValue(dadosAniversario);
        listarAfastamentosNoticias.mockResolvedValue(dadosAfastamento);
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
        expect(setSearchParams).toHaveBeenCalledWith({ secao: 'afastamento' }, { replace: true });
        expect(screen.getByRole('heading', { name: /quem está saindo/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /quem está voltando/i })).toBeInTheDocument();
        expect(screen.getByText('Diego')).toBeInTheDocument();
    });

    it('deve iniciar na aba informada pela url', async () => {
        searchParams = new URLSearchParams({ secao: 'afastamento' });

        render(<NoticiasPage />);

        await waitFor(() => {
            expect(screen.getByText('Carla')).toBeInTheDocument();
        });

        expect(listarAfastamentosNoticias).toHaveBeenCalled();
    });

    it('deve ignorar secao invalida na url', async () => {
        searchParams = new URLSearchParams({ secao: 'invalida' });

        render(<NoticiasPage />);

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        expect(listarAniversariantesNoticias).toHaveBeenCalled();
    });

    it('deve exibir erro ao falhar carregamento de aniversariantes', async () => {
        listarAniversariantesNoticias.mockRejectedValue(new Error('Falha na API'));

        render(<NoticiasPage />);

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha na API');
    });

    it('deve exibir erro generico ao falhar carregamento de aniversariantes', async () => {
        listarAniversariantesNoticias.mockRejectedValue(new Error());

        render(<NoticiasPage />);

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível carregar os aniversariantes.'
        );
    });

    it('deve sincronizar aba quando secao da url mudar', async () => {
        searchParams = new URLSearchParams({ secao: 'aniversario' });

        const { rerender } = render(<NoticiasPage />);

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        searchParams = new URLSearchParams({ secao: 'afastamento' });
        rerender(<NoticiasPage />);

        await waitFor(() => {
            expect(screen.getByText('Carla')).toBeInTheDocument();
        });
    });

    it('deve exibir erro generico ao falhar carregamento de afastamentos', async () => {
        const usuario = userEvent.setup();
        listarAfastamentosNoticias.mockRejectedValue(new Error());

        render(<NoticiasPage />);

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /afastamento/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível carregar os afastamentos.'
        );
    });

    it('deve limpar mensagem de erro automaticamente', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        listarAniversariantesNoticias.mockRejectedValue(new Error('Erro temporário'));

        render(<NoticiasPage />);

        expect(await screen.findByText('Erro temporário')).toBeInTheDocument();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        expect(screen.queryByText('Erro temporário')).not.toBeInTheDocument();
        vi.useRealTimers();
    });
});
