import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EntregaImediataEpiPage } from './EntregaImediataEpiPage.jsx';

function renderizarPagina() {
    return render(
        <MemoryRouter>
            <EntregaImediataEpiPage />
        </MemoryRouter>
    );
}

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../../shared/components/MensagemFeedback.jsx', () => ({
    AreaMensagensFeedback: ({
        erro = '',
        sucesso = '',
        onLimparErro,
        onLimparSucesso
    }) => {
        if (!erro && !sucesso) {
            return null;
        }

        return (
            <div>
                {erro ? <p role="alert">{erro}</p> : null}
                {sucesso ? <p role="status">{sucesso}</p> : null}
                {onLimparErro ? (
                    <button type="button" onClick={onLimparErro}>
                        limpar-erro
                    </button>
                ) : null}
                {onLimparSucesso ? (
                    <button type="button" onClick={onLimparSucesso}>
                        limpar-sucesso
                    </button>
                ) : null}
            </div>
        );
    }
}));

vi.mock('../services/epiEntregasApi.js', () => ({
    buscarPainelEntregasEpi: vi.fn(),
    registrarEntregaEpi: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { buscarPainelEntregasEpi, registrarEntregaEpi } = await import('../services/epiEntregasApi.js');

const episVencidos = [
    {
        employeeId: 'f1',
        employeeName: 'Ana Silva',
        epiName: 'Capacete',
        caNumber: '12345',
        nextDueDate: '2026-01-01'
    }
];

describe('EntregaImediataEpiPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        buscarPainelEntregasEpi.mockResolvedValue({ episVencidos });
        registrarEntregaEpi.mockResolvedValue({ message: 'Entrega registrada.' });
    });

    it('deve carregar e exibir epis vencidos', async () => {
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByText('Ana Silva')).toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: /entregas de epi/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /entrega imediata/i })).toBeInTheDocument();
    });

    it('deve registrar entrega rapida', async () => {
        const usuario = userEvent.setup();
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByText('Ana Silva')).toBeInTheDocument();
        });

        await usuario.click(screen.getByTitle(/registrar entrega/i));

        await waitFor(() => {
            expect(registrarEntregaEpi).toHaveBeenCalledWith(
                { employeeId: 'f1', caNumbers: ['12345'] },
                'jwt'
            );
            expect(screen.getByText('Entrega registrada.')).toBeInTheDocument();
        });
    });

    it('deve exibir mensagem padrao de sucesso sem retorno da api', async () => {
        const usuario = userEvent.setup();
        registrarEntregaEpi.mockResolvedValue({});

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByText('Ana Silva')).toBeInTheDocument();
        });

        await usuario.click(screen.getByTitle(/registrar entrega/i));

        expect(await screen.findByText('Entrega registrada com sucesso.')).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        buscarPainelEntregasEpi.mockRejectedValue(new Error('Painel indisponível.'));

        renderizarPagina();

        expect(await screen.findByRole('alert')).toHaveTextContent('Painel indisponível.');
    });

    it('deve exibir erro generico ao falhar carregamento', async () => {
        buscarPainelEntregasEpi.mockRejectedValue(new Error());

        renderizarPagina();

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível carregar os EPIs vencidos.'
        );
    });

    it('deve exibir erro ao falhar entrega rapida', async () => {
        const usuario = userEvent.setup();
        registrarEntregaEpi.mockRejectedValue(new Error('Falha na entrega.'));

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByText('Ana Silva')).toBeInTheDocument();
        });

        await usuario.click(screen.getByTitle(/registrar entrega/i));

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha na entrega.');
    });

    it('deve exibir erro generico ao falhar entrega rapida', async () => {
        const usuario = userEvent.setup();
        registrarEntregaEpi.mockRejectedValue(new Error());

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByText('Ana Silva')).toBeInTheDocument();
        });

        await usuario.click(screen.getByTitle(/registrar entrega/i));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível registrar a entrega imediata.'
        );
    });

    it('deve tratar painel sem epis vencidos', async () => {
        buscarPainelEntregasEpi.mockResolvedValue({});

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByText(/nenhum funcionário com epi vencido/i)).toBeInTheDocument();
        });
    });

    it('deve limpar erro de carregamento', async () => {
        const usuario = userEvent.setup();
        buscarPainelEntregasEpi.mockRejectedValue(new Error('Painel indisponível.'));

        renderizarPagina();

        expect(await screen.findByRole('alert')).toHaveTextContent('Painel indisponível.');
        await usuario.click(screen.getByRole('button', { name: 'limpar-erro' }));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    it('deve limpar mensagens de feedback', async () => {
        const usuario = userEvent.setup();
        registrarEntregaEpi.mockResolvedValue({ message: 'Entrega registrada.' });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByText('Ana Silva')).toBeInTheDocument();
        });

        await usuario.click(screen.getByTitle(/registrar entrega/i));
        expect(await screen.findByText('Entrega registrada.')).toBeInTheDocument();
        await usuario.click(screen.getByRole('button', { name: 'limpar-sucesso' }));

        await waitFor(() => {
            expect(screen.queryByText('Entrega registrada.')).not.toBeInTheDocument();
        });
    });
});
