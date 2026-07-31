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

    it('deve exibir estado vazio quando nao houver cadastros', () => {
        render(
            <MemoryRouter>
                <TabelaProcessoAprovacao cadastros={[]} />
            </MemoryRouter>
        );

        expect(
            screen.getByText(/nenhum cadastro em processo de aprovação/i)
        ).toBeInTheDocument();
    });

    it('deve usar valores padrao quando nome, email e vaga nao estiverem disponiveis', () => {
        render(
            <MemoryRouter>
                <TabelaProcessoAprovacao
                    cadastros={[
                        {
                            id: 'cad3',
                            status: 'OUTRO_STATUS'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        const linhas = screen.getAllByRole('cell');
        expect(linhas[0]).toHaveTextContent('—');
        expect(linhas[1]).toHaveTextContent('—');
        expect(linhas[2]).toHaveTextContent('—');
        expect(screen.getByText('OUTRO_STATUS')).toBeInTheDocument();
    });

    it('deve usar nome e email da candidatura quando o cadastro nao tiver esses dados diretamente', () => {
        render(
            <MemoryRouter>
                <TabelaProcessoAprovacao
                    cadastros={[
                        {
                            id: 'cad4',
                            status: 'OUTRO_STATUS',
                            candidatura: {
                                nomeCompleto: 'Nome via candidatura',
                                email: 'via-candidatura@email.com'
                            }
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('Nome via candidatura')).toBeInTheDocument();
        expect(screen.getByText('via-candidatura@email.com')).toBeInTheDocument();
    });
});
