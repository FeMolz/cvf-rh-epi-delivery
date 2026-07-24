import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { TabelaProcessoAprovacao } from './TabelaProcessoAprovacao.jsx';
import { STATUS_CADASTRO_CONTRATACAO } from '../constants/recrutamentoConstantes.js';

describe('TabelaProcessoAprovacao', () => {
    const cadastros = [
        {
            id: 'cad1',
            name: 'Maria Silva',
            email: 'maria@email.com',
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO,
            candidatura: {
                nomeCompleto: 'Maria Silva',
                email: 'maria@email.com',
                anuncioVaga: { tituloVaga: 'Analista' }
            }
        },
        {
            id: 'cad2',
            name: 'João Souza',
            email: 'joao@email.com',
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH,
            candidatura: {
                nomeCompleto: 'João Souza',
                email: 'joao@email.com',
                anuncioVaga: { tituloVaga: 'Assistente' }
            }
        }
    ];

    it('deve exibir botao de cancelar ao lado de reenviar e-mail', async () => {
        const usuario = userEvent.setup();
        const onCancelarProcesso = vi.fn();
        const onReenviarEmail = vi.fn();

        render(
            <MemoryRouter>
                <TabelaProcessoAprovacao
                    cadastros={cadastros}
                    onReenviarEmail={onReenviarEmail}
                    onCancelarProcesso={onCancelarProcesso}
                />
            </MemoryRouter>
        );

        expect(screen.getByRole('button', { name: /reenviar e-mail/i })).toBeInTheDocument();
        const botoesCancelar = screen.getAllByRole('button', { name: /cancelar processo/i });
        expect(botoesCancelar).toHaveLength(2);

        await usuario.click(botoesCancelar[0]);
        expect(onCancelarProcesso).toHaveBeenCalledWith(cadastros[0]);
    });

    it('deve exibir botao de cancelar junto com validar', () => {
        render(
            <MemoryRouter>
                <TabelaProcessoAprovacao
                    cadastros={[cadastros[1]]}
                    onCancelarProcesso={vi.fn()}
                />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: /validar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancelar processo/i })).toBeInTheDocument();
    });

    it('nao deve exibir botao de cancelar sem callback', () => {
        render(
            <MemoryRouter>
                <TabelaProcessoAprovacao cadastros={cadastros} onReenviarEmail={vi.fn()} />
            </MemoryRouter>
        );

        expect(screen.queryByRole('button', { name: /cancelar processo/i })).not.toBeInTheDocument();
    });
});
