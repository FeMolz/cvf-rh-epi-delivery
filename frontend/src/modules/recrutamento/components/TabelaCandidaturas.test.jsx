import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TabelaCandidaturas } from './TabelaCandidaturas.jsx';

describe('TabelaCandidaturas', () => {
    it('deve abrir descricao ao clicar no nome do candidato', async () => {
        const usuario = userEvent.setup();
        const onAbrirDetalhe = vi.fn();

        render(
            <TabelaCandidaturas
                candidaturas={[
                    {
                        id: 'c1',
                        nomeCompleto: 'Maria Silva',
                        email: 'maria@teste.com',
                        status: 'PENDENTE',
                        pretensaoSalarial: 'R$ 5.000',
                        mensagemCandidato: 'Desejo contribuir com o time.',
                        curriculoNomeArquivo: 'curriculo.pdf',
                        descricaoVisualizadaEm: '2026-07-24',
                        curriculoVisualizadoEm: '2026-07-24',
                        createdAt: '2026-01-01T00:00:00.000Z'
                    }
                ]}
                candidaturaDetalhe={{
                    id: 'c1',
                    nomeCompleto: 'Maria Silva',
                    pretensaoSalarial: 'R$ 5.000',
                    mensagemCandidato: 'Desejo contribuir com o time.'
                }}
                onAbrirDetalhe={onAbrirDetalhe}
                onFecharDetalhe={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarCurriculo={vi.fn()}
            />
        );

        await usuario.click(screen.getByRole('button', { name: /maria silva/i }));
        expect(onAbrirDetalhe).toHaveBeenCalled();
        expect(screen.getByText(/pretensão salarial: r\$ 5\.000/i)).toBeInTheDocument();
        expect(screen.getByText(/desejo contribuir com o time/i)).toBeInTheDocument();
        expect(screen.queryByText('NOVO')).not.toBeInTheDocument();
    });

    it('deve exibir tag NOVO quando descricao e curriculo nao foram visualizados', () => {
        render(
            <TabelaCandidaturas
                candidaturas={[
                    {
                        id: 'c2',
                        nomeCompleto: 'João',
                        email: 'joao@teste.com',
                        status: 'PENDENTE',
                        mensagemCandidato: 'Olá',
                        curriculoNomeArquivo: 'cv.pdf',
                        createdAt: '2026-01-01T00:00:00.000Z'
                    }
                ]}
                onAbrirDetalhe={vi.fn()}
                onFecharDetalhe={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarCurriculo={vi.fn()}
            />
        );

        expect(screen.getByText('NOVO')).toBeInTheDocument();
    });

    it('nao deve exibir tag NOVO quando descricao ja foi visualizada', () => {
        render(
            <TabelaCandidaturas
                candidaturas={[
                    {
                        id: 'c3',
                        nomeCompleto: 'Ana',
                        email: 'ana@teste.com',
                        status: 'PENDENTE',
                        descricaoVisualizadaEm: '2026-07-24T00:00:00.000Z',
                        createdAt: '2026-01-01T00:00:00.000Z'
                    }
                ]}
                onAbrirDetalhe={vi.fn()}
                onFecharDetalhe={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarCurriculo={vi.fn()}
            />
        );

        expect(screen.queryByText('NOVO')).not.toBeInTheDocument();
    });

    it('nao deve exibir tag NOVO quando curriculo ja foi visualizado', () => {
        render(
            <TabelaCandidaturas
                candidaturas={[
                    {
                        id: 'c4',
                        nomeCompleto: 'Bruno',
                        email: 'bruno@teste.com',
                        status: 'PENDENTE',
                        curriculoVisualizadoEm: '2026-07-24T00:00:00.000Z',
                        createdAt: '2026-01-01T00:00:00.000Z'
                    }
                ]}
                onAbrirDetalhe={vi.fn()}
                onFecharDetalhe={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarCurriculo={vi.fn()}
            />
        );

        expect(screen.queryByText('NOVO')).not.toBeInTheDocument();
    });

    it('deve exibir convite cadastro em candidatura reativada na proxima fase', () => {
        const onGerarConvite = vi.fn();

        render(
            <TabelaCandidaturas
                candidaturas={[
                    {
                        id: 'c5',
                        nomeCompleto: 'Carla',
                        email: 'carla@teste.com',
                        status: 'PROXIMA_FASE',
                        descricaoVisualizadaEm: '2026-07-24',
                        createdAt: '2026-01-01T00:00:00.000Z'
                    }
                ]}
                onAbrirDetalhe={vi.fn()}
                onFecharDetalhe={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarCurriculo={vi.fn()}
                onGerarConvite={onGerarConvite}
            />
        );

        expect(screen.getByRole('button', { name: /convite cadastro/i })).toBeInTheDocument();
    });
});
