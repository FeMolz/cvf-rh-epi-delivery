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

    it('deve exibir estado vazio quando nao houver candidaturas', () => {
        render(
            <TabelaCandidaturas
                candidaturas={[]}
                onAbrirDetalhe={vi.fn()}
                onFecharDetalhe={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarCurriculo={vi.fn()}
            />
        );

        expect(screen.getByText(/nenhuma candidatura encontrada/i)).toBeInTheDocument();
    });

    it('deve exibir mensagem padrao quando nao houver mensagem do candidato nem data', () => {
        render(
            <TabelaCandidaturas
                candidaturas={[
                    {
                        id: 'c6',
                        nomeCompleto: 'Sem Data',
                        email: 'semdata@teste.com',
                        status: 'PENDENTE',
                        descricaoVisualizadaEm: '2026-07-24',
                        curriculoVisualizadoEm: '2026-07-24'
                    }
                ]}
                candidaturaDetalhe={{
                    id: 'c6',
                    nomeCompleto: 'Sem Data',
                    pretensaoSalarial: '',
                    mensagemCandidato: '   '
                }}
                onAbrirDetalhe={vi.fn()}
                onFecharDetalhe={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarCurriculo={vi.fn()}
            />
        );

        expect(screen.getByText(/pretensão salarial: não informada/i)).toBeInTheDocument();
        expect(screen.getByText(/sem descrição enviada/i)).toBeInTheDocument();
        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('deve alterar status da candidatura pelo seletor', async () => {
        const usuario = userEvent.setup();
        const onAlterarStatus = vi.fn();

        render(
            <TabelaCandidaturas
                candidaturas={[
                    {
                        id: 'c7',
                        nomeCompleto: 'Carlos',
                        email: 'carlos@teste.com',
                        status: 'PENDENTE',
                        createdAt: '2026-01-01T00:00:00.000Z'
                    }
                ]}
                onAbrirDetalhe={vi.fn()}
                onFecharDetalhe={vi.fn()}
                onAlterarStatus={onAlterarStatus}
                onBaixarCurriculo={vi.fn()}
            />
        );

        await usuario.selectOptions(
            screen.getByRole('combobox'),
            'PROXIMA_FASE'
        );

        expect(onAlterarStatus).toHaveBeenCalledWith('c7', 'PROXIMA_FASE');
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

    it('deve baixar curriculo e gerar convite ao clicar nos respectivos botoes', async () => {
        const usuario = userEvent.setup({ delay: null });
        const onBaixarCurriculo = vi.fn();
        const onGerarConvite = vi.fn();

        render(
            <TabelaCandidaturas
                candidaturas={[
                    {
                        id: 'c8',
                        nomeCompleto: 'Fernanda',
                        email: 'fernanda@teste.com',
                        status: 'PROXIMA_FASE',
                        curriculoNomeArquivo: 'cv.pdf',
                        descricaoVisualizadaEm: '2026-07-24',
                        createdAt: '2026-01-01T00:00:00.000Z'
                    }
                ]}
                onAbrirDetalhe={vi.fn()}
                onFecharDetalhe={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarCurriculo={onBaixarCurriculo}
                onGerarConvite={onGerarConvite}
            />
        );

        await usuario.click(screen.getByRole('button', { name: /currículo/i }));
        expect(onBaixarCurriculo).toHaveBeenCalledWith('c8');

        await usuario.click(screen.getByRole('button', { name: /convite cadastro/i }));
        expect(onGerarConvite).toHaveBeenCalledWith('c8');
    });

    it('deve reativar candidatura na lixeira ao clicar no botao reativar', async () => {
        const usuario = userEvent.setup({ delay: null });
        const onReativar = vi.fn();

        render(
            <TabelaCandidaturas
                candidaturas={[
                    {
                        id: 'c9',
                        nomeCompleto: 'Gustavo',
                        email: 'gustavo@teste.com',
                        status: 'DESCARTADO',
                        createdAt: '2026-01-01T00:00:00.000Z'
                    }
                ]}
                modoLixeira
                onAbrirDetalhe={vi.fn()}
                onFecharDetalhe={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarCurriculo={vi.fn()}
                onReativar={onReativar}
            />
        );

        await usuario.click(screen.getByRole('button', { name: /^reativar$/i }));
        expect(onReativar).toHaveBeenCalledWith('c9');
    });

    it('deve exibir titulo da vaga ou travessao quando coluna de vaga estiver visivel', () => {
        render(
            <TabelaCandidaturas
                candidaturas={[
                    {
                        id: 'c10',
                        nomeCompleto: 'Helena',
                        email: 'helena@teste.com',
                        status: 'PENDENTE',
                        anuncioVaga: { tituloVaga: 'Vaga com titulo' },
                        createdAt: '2026-01-01T00:00:00.000Z'
                    },
                    {
                        id: 'c11',
                        nomeCompleto: 'Igor',
                        email: 'igor@teste.com',
                        status: 'PENDENTE',
                        createdAt: '2026-01-01T00:00:00.000Z'
                    }
                ]}
                exibirColunaVaga
                onAbrirDetalhe={vi.fn()}
                onFecharDetalhe={vi.fn()}
                onAlterarStatus={vi.fn()}
                onBaixarCurriculo={vi.fn()}
            />
        );

        expect(screen.getByText('Vaga com titulo')).toBeInTheDocument();
        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('deve fechar detalhe ao confirmar ou cancelar o dialogo', async () => {
        const usuario = userEvent.setup({ delay: null });
        const onFecharDetalhe = vi.fn();

        render(
            <TabelaCandidaturas
                candidaturas={[
                    {
                        id: 'c12',
                        nomeCompleto: 'Julia',
                        email: 'julia@teste.com',
                        status: 'PENDENTE',
                        createdAt: '2026-01-01T00:00:00.000Z'
                    }
                ]}
                candidaturaDetalhe={{ id: 'c12', nomeCompleto: 'Julia' }}
                onAbrirDetalhe={vi.fn()}
                onFecharDetalhe={onFecharDetalhe}
                onAlterarStatus={vi.fn()}
                onBaixarCurriculo={vi.fn()}
            />
        );

        await usuario.click(screen.getByRole('button', { name: /^ok$/i }));
        expect(onFecharDetalhe).toHaveBeenCalledTimes(1);

        await usuario.click(screen.getByRole('presentation'));
        expect(onFecharDetalhe).toHaveBeenCalledTimes(2);
    });
});
