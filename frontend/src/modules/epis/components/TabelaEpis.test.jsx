import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { TabelaEpis } from './TabelaEpis.jsx';

describe('TabelaEpis', () => {
    it('deve exibir estado vazio', () => {
        render(<TabelaEpis epis={[]} />);

        expect(screen.getByText(/nenhum epi encontrado/i)).toBeInTheDocument();
    });

    it('deve exibir epis ativos e inativos', () => {
        render(
            <TabelaEpis
                epis={[
                    {
                        id: '1',
                        name: 'Capacete',
                        caNumber: '11070',
                        isActive: true,
                        caExpirationDate: '2027-01-01'
                    },
                    {
                        id: '2',
                        name: 'Luva',
                        caNumber: '22080',
                        isActive: false,
                        caExpirationDate: null
                    }
                ]}
            />
        );

        expect(screen.getByText('Capacete')).toBeInTheDocument();
        expect(screen.getByText('Luva')).toBeInTheDocument();
        expect(screen.getByText('Ativo')).toBeInTheDocument();
        expect(screen.getByText('Inativo')).toBeInTheDocument();
    });
});
