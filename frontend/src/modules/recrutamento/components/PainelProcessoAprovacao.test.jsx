import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { STATUS_CADASTRO_CONTRATACAO } from '../constants/recrutamentoConstantes.js';

const listarCadastrosContratacao = vi.fn();
const reenviarEmailConviteCadastro = vi.fn();
const atualizarStatusCadastroContratacao = vi.fn();

vi.mock('../services/recrutamentoApi.js', () => ({
    listarCadastrosContratacao: (...args) => listarCadastrosContratacao(...args),
    reenviarEmailConviteCadastro: (...args) => reenviarEmailConviteCadastro(...args),
    atualizarStatusCadastroContratacao: (...args) => atualizarStatusCadastroContratacao(...args)
}));

const { PainelProcessoAprovacao } = await import('./PainelProcessoAprovacao.jsx');

describe('PainelProcessoAprovacao', () => {
    const cadastro = {
        id: 'cad1',
        name: 'Maria Silva',
        email: 'maria@email.com',
        status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO,
        candidatura: {
            nomeCompleto: 'Maria Silva',
            email: 'maria@email.com',
            anuncioVaga: { tituloVaga: 'Analista' }
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        listarCadastrosContratacao.mockResolvedValue([cadastro]);
        atualizarStatusCadastroContratacao.mockResolvedValue({
            id: 'cad1',
            status: STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO
        });
    });

    it('deve cancelar processo apos confirmacao e remover da lista', async () => {
        const usuario = userEvent.setup();
        listarCadastrosContratacao
            .mockResolvedValueOnce([cadastro])
            .mockResolvedValueOnce([]);

        render(
            <MemoryRouter>
                <PainelProcessoAprovacao token="token-teste" />
            </MemoryRouter>
        );

        expect(await screen.findByText('Maria Silva')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /cancelar processo/i }));

        const dialogo = screen.getByRole('alertdialog');
        expect(within(dialogo).getByRole('heading', { name: /cancelar processo/i })).toBeInTheDocument();

        await usuario.click(
            within(dialogo).getByRole('button', { name: /^cancelar processo$/i })
        );

        await waitFor(() => {
            expect(atualizarStatusCadastroContratacao).toHaveBeenCalledWith(
                'cad1',
                { status: STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO },
                'token-teste'
            );
        });

        expect(
            await screen.findByText(/processo cancelado\. o candidato foi movido para a lixeira/i)
        ).toBeInTheDocument();
    });
});
