import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { TabelaCargos } from './TabelaCargos.jsx';

describe('TabelaCargos', () => {
    it('deve exibir cargos com quantidade de EPIs', () => {
        render(
            <MemoryRouter>
                <TabelaCargos
                    cargos={[
                        {
                            id: '1',
                            name: 'Operador',
                            description: 'Linha 1',
                            createdAt: '2024-01-10T10:00:00.000Z',
                            _count: { roleEpis: 4 }
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: 'Operador' })).toHaveAttribute('href', '/admin/cargos/1');
        expect(screen.getByText('Linha 1')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('deve exibir estado vazio', () => {
        render(
            <MemoryRouter>
                <TabelaCargos cargos={[]} />
            </MemoryRouter>
        );

        expect(screen.getByText(/nenhum cargo encontrado/i)).toBeInTheDocument();
    });
});
