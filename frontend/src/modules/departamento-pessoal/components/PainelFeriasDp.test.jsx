import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { PainelFeriasDp } from './PainelFeriasDp.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../funcionarios/services/funcionariosApi.js', () => ({
    listarFeriasFuncionarios: vi.fn()
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

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarFeriasFuncionarios } = await import('../../funcionarios/services/funcionariosApi.js');

describe('PainelFeriasDp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarFeriasFuncionarios.mockResolvedValue({
            items: [
                {
                    id: '1',
                    name: 'Ana',
                    cpf: '123',
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

    it('deve carregar férias com filtros padrão', async () => {
        render(
            <MemoryRouter>
                <PainelFeriasDp />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        expect(listarFeriasFuncionarios).toHaveBeenCalledWith(
            'jwt',
            expect.objectContaining({ proximidade: 30, page: 1 })
        );

        // Dispara o debounce inicial com busca inalterada (early-return).
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 450));
        });
    });

    it('deve aplicar filtros e paginar', async () => {
        const usuario = userEvent.setup();
        listarFeriasFuncionarios.mockResolvedValue({
            items: [{ id: '1', name: 'Ana', cpf: '123', status: 'FERIAS', company: { name: 'CVF' } }],
            total: 30,
            page: 1,
            pageSize: 25
        });

        render(
            <MemoryRouter>
                <PainelFeriasDp />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText('Ordenação'), 'vencidos_primeiro');
        await usuario.selectOptions(screen.getByLabelText('Proximidade'), '60');

        await waitFor(() => {
            expect(listarFeriasFuncionarios).toHaveBeenLastCalledWith(
                'jwt',
                expect.objectContaining({
                    ordenacao: 'vencidos_primeiro',
                    proximidade: 60,
                    page: 1
                })
            );
        });

        await usuario.type(screen.getByLabelText(/funcionário \(nome ou cpf\)/i), 'Ana');

        await waitFor(
            () => {
                expect(listarFeriasFuncionarios).toHaveBeenLastCalledWith(
                    'jwt',
                    expect.objectContaining({
                        ordenacao: 'vencidos_primeiro',
                        proximidade: 60,
                        busca: 'Ana',
                        page: 1
                    })
                );
            },
            { timeout: 2000 }
        );

        listarFeriasFuncionarios.mockClear();
        listarFeriasFuncionarios.mockResolvedValue({
            items: [{ id: '2', name: 'Bruno', cpf: '456', status: 'FERIAS', company: { name: 'CVF' } }],
            total: 30,
            page: 2,
            pageSize: 25
        });

        await usuario.click(screen.getByRole('button', { name: 'Próxima' }));

        await waitFor(() => {
            expect(listarFeriasFuncionarios).toHaveBeenCalledWith(
                'jwt',
                expect.objectContaining({ page: 2 })
            );
        });

        await usuario.selectOptions(screen.getByLabelText('Por página'), '50');

        await waitFor(() => {
            expect(listarFeriasFuncionarios).toHaveBeenLastCalledWith(
                'jwt',
                expect.objectContaining({ pageSize: 50, page: 1 })
            );
        });

        await usuario.click(screen.getByRole('button', { name: 'Anterior' }));
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        listarFeriasFuncionarios.mockRejectedValue(new Error('Falha nas férias'));

        render(
            <MemoryRouter>
                <PainelFeriasDp />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha nas férias');
    });

    it('deve exibir erro generico ao falhar carregamento', async () => {
        listarFeriasFuncionarios.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <PainelFeriasDp />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar as férias.');
    });

    it('deve limpar mensagem de erro manualmente', async () => {
        const usuario = userEvent.setup();
        listarFeriasFuncionarios.mockRejectedValue(new Error('Falha nas férias'));

        render(
            <MemoryRouter>
                <PainelFeriasDp />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha nas férias');

        await usuario.click(screen.getByRole('button', { name: 'limpar-erro' }));

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
