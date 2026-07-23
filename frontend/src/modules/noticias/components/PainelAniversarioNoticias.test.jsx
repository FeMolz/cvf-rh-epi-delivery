import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PainelAniversarioNoticias } from './PainelAniversarioNoticias.jsx';

describe('PainelAniversarioNoticias', () => {
    it('deve exibir descricao e tabelas de aniversariantes', () => {
        render(
            <PainelAniversarioNoticias
                mesReferencia="Julho/2026"
                aniversariantesPessoais={[
                    {
                        id: '1',
                        nome: 'Ana Silva',
                        empresa: 'CVF',
                        dataAniversario: '10/07'
                    }
                ]}
                aniversariantesEmpresa={[
                    {
                        id: '2',
                        nome: 'Bruno Costa',
                        empresa: 'CVF',
                        dataAniversarioEmpresa: '15/07',
                        tempoEmpresa: '5 anos'
                    }
                ]}
            />
        );

        expect(
            screen.getByText(/aniversariantes do mês entre todos os funcionários/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/referência: julho\/2026/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Aniversariantes' })).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Aniversariantes de tempo de empresa' })
        ).toBeInTheDocument();
        expect(screen.getByText('Ana Silva')).toBeInTheDocument();
        expect(screen.getByText('Bruno Costa')).toBeInTheDocument();
    });

    it('deve omitir referencia quando mes nao for informado', () => {
        render(
            <PainelAniversarioNoticias
                aniversariantesPessoais={[]}
                aniversariantesEmpresa={[]}
            />
        );

        expect(screen.queryByText(/referência:/i)).not.toBeInTheDocument();
        expect(screen.getAllByText('Nenhum registro para o mês atual.')).toHaveLength(2);
    });
});
