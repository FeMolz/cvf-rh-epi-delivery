import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { TabelaPreviewEntregasRelatorio } from './TabelaPreviewEntregasRelatorio.jsx';

describe('TabelaPreviewEntregasRelatorio', () => {
    it('deve exibir estado de carregamento', () => {
        render(<TabelaPreviewEntregasRelatorio carregando />);

        expect(screen.getByText(/carregando prévia/i)).toBeInTheDocument();
    });

    it('deve exibir mensagem quando funcionario nao selecionado', () => {
        render(<TabelaPreviewEntregasRelatorio />);

        expect(screen.getByText(/selecione o funcionário e o período/i)).toBeInTheDocument();
    });

    it('deve exibir entregas do funcionario', () => {
        render(
            <TabelaPreviewEntregasRelatorio
                textoPeriodoReferencia="01/01/2026 a 31/01/2026"
                funcionario={{
                    name: 'Ana Silva',
                    roleName: 'Soldador',
                    companyName: 'CVF',
                    setorName: 'Produção'
                }}
                entregas={[
                    {
                        dataEntrega: '10/01/2026',
                        nomeEquipamento: 'Capacete',
                        numeroCa: '12345'
                    }
                ]}
            />
        );

        expect(screen.getByRole('heading', { name: /prévia do relatório/i })).toBeInTheDocument();
        expect(screen.getByText('Ana Silva')).toBeInTheDocument();
        expect(screen.getByText(/CVF · Produção/)).toBeInTheDocument();
        expect(screen.getByText('Capacete')).toBeInTheDocument();
        expect(screen.getByText('12345')).toBeInTheDocument();
    });

    it('deve exibir vazio quando nao ha entregas', () => {
        render(
            <TabelaPreviewEntregasRelatorio
                funcionario={{ name: 'Ana Silva' }}
                entregas={[]}
            />
        );

        expect(screen.getByText(/nenhuma entrega de epi encontrada/i)).toBeInTheDocument();
    });
});
