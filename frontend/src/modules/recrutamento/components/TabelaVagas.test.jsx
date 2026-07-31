import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { TabelaVagas } from './TabelaVagas.jsx';

describe('TabelaVagas', () => {
    const vagas = [
        {
            id: 'v1',
            tituloVaga: 'Analista',
            localTrabalho: 'São Paulo',
            modoTrabalho: 'HIBRIDO',
            tipoContratacao: 'CLT',
            status: 'INATIVA'
        },
        {
            id: 'v2',
            tituloVaga: 'Assistente',
            localTrabalho: 'Remoto',
            modoTrabalho: 'REMOTO',
            tipoContratacao: 'PJ',
            status: 'ATIVA'
        }
    ];

    it('deve exibir botao publicar apenas para vagas em rascunho', async () => {
        const usuario = userEvent.setup();
        const onPublicarVaga = vi.fn();

        render(
            <MemoryRouter>
                <TabelaVagas vagas={vagas} onPublicarVaga={onPublicarVaga} />
            </MemoryRouter>
        );

        expect(screen.getByRole('button', { name: /^publicar$/i })).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /^publicar$/i })).toHaveLength(1);

        await usuario.click(screen.getByRole('button', { name: /^publicar$/i }));

        expect(onPublicarVaga).toHaveBeenCalledWith('v1');
    });

    it('deve exibir botao encerrar apenas para vagas ativas', async () => {
        const usuario = userEvent.setup();
        const onEncerrarVaga = vi.fn();

        render(
            <MemoryRouter>
                <TabelaVagas vagas={vagas} onEncerrarVaga={onEncerrarVaga} />
            </MemoryRouter>
        );

        expect(screen.getByRole('button', { name: /^encerrar$/i })).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /^encerrar$/i })).toHaveLength(1);

        await usuario.click(screen.getByRole('button', { name: /^encerrar$/i }));

        expect(onEncerrarVaga).toHaveBeenCalledWith('v2');
    });

    it('nao deve exibir coluna de acoes sem callbacks', () => {
        render(
            <MemoryRouter>
                <TabelaVagas vagas={vagas} />
            </MemoryRouter>
        );

        expect(screen.queryByRole('columnheader', { name: /ações/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /publicar/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /encerrar/i })).not.toBeInTheDocument();
    });

    it('deve exibir status ativo com badge verde', () => {
        render(
            <MemoryRouter>
                <TabelaVagas vagas={vagas} />
            </MemoryRouter>
        );

        expect(screen.getByText('Ativa')).toHaveClass('status-badge--ativo');
    });

    it('deve exibir estado vazio quando nao houver vagas', () => {
        render(
            <MemoryRouter>
                <TabelaVagas vagas={[]} />
            </MemoryRouter>
        );

        expect(
            screen.getByText(/nenhuma vaga encontrada para os filtros aplicados/i)
        ).toBeInTheDocument();
    });
});
