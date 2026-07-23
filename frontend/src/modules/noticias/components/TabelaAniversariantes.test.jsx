import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { TabelaAniversariantes } from './TabelaAniversariantes.jsx';

describe('TabelaAniversariantes', () => {
    const colunas = [
        { id: 'nome', rotulo: 'Nome' },
        { id: 'empresa', rotulo: 'Empresa' }
    ];

    it('deve destacar aniversariante do dia', () => {
        render(
            <TabelaAniversariantes
                titulo="Aniversariantes"
                colunas={colunas}
                itens={[
                    { id: '1', nome: 'Ana Silva', empresa: 'CVF', ehHoje: true },
                    { id: '2', nome: 'Bruno Costa', empresa: 'CVF', ehHoje: false }
                ]}
            />
        );

        expect(screen.getByText('Ana Silva')).toHaveClass('aniversariante-hoje');
        expect(screen.getByText('Bruno Costa')).not.toHaveClass('aniversariante-hoje');
        expect(screen.getByText('Ana Silva').closest('tr')).toHaveClass('tabela-usuarios__linha--destaque');
    });

    it('deve destacar aniversariante do dia sem nome informado', () => {
        render(
            <TabelaAniversariantes
                titulo="Aniversariantes"
                colunas={colunas}
                itens={[{ id: '1', nome: '', empresa: 'CVF', ehHoje: true }]}
            />
        );

        expect(screen.getByText('—')).toHaveClass('aniversariante-hoje');
    });

    it('deve exibir estado vazio quando nao houver itens', () => {
        render(
            <TabelaAniversariantes
                titulo="Aniversariantes"
                colunas={colunas}
                itens={[]}
            />
        );

        expect(screen.getByText('Nenhum registro para o mês atual.')).toBeInTheDocument();
    });

    it('deve renderizar nome sem destaque e valores ausentes', () => {
        render(
            <TabelaAniversariantes
                titulo="Aniversariantes"
                colunas={colunas}
                itens={[{ id: '1', nome: 'Carlos', empresa: null }]}
                campoVazio="Sem dados"
            />
        );

        expect(screen.getByText('Carlos')).not.toHaveClass('aniversariante-hoje');
        expect(screen.getByText('—')).toBeInTheDocument();
    });
});
