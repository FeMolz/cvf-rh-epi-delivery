import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PainelAfastamentoNoticias } from './PainelAfastamentoNoticias.jsx';

describe('PainelAfastamentoNoticias', () => {
    it('deve exibir tabelas de saída e retorno com referência do mês', () => {
        render(
            <PainelAfastamentoNoticias
                mesReferencia="julho de 2026"
                saindo={[
                    {
                        id: '1',
                        nome: 'Ana',
                        empresa: 'CVF',
                        situacao: 'Férias',
                        previsaoRetorno: '10/08'
                    }
                ]}
                voltando={[
                    {
                        id: '2',
                        nome: 'Bruno',
                        empresa: 'CVF',
                        situacao: 'Licença',
                        dataRetorno: '25/07'
                    }
                ]}
            />
        );

        expect(screen.getByText(/Referência: julho de 2026/)).toBeInTheDocument();
        expect(screen.getByText('Ana')).toBeInTheDocument();
        expect(screen.getByText('Bruno')).toBeInTheDocument();
    });

    it('deve exibir mensagens vazias quando não houver registros', () => {
        render(<PainelAfastamentoNoticias mesReferencia="" saindo={[]} voltando={[]} />);

        expect(
            screen.getByText('Nenhum funcionário em afastamento fora do retorno previsto neste mês.')
        ).toBeInTheDocument();
        expect(screen.getByText('Nenhum retorno previsto para o mês atual.')).toBeInTheDocument();
    });
});
