import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { TabelaCargosDashboard } from './TabelaCargosDashboard.jsx';

describe('TabelaCargosDashboard', () => {
    it('deve exibir status ativo e inativo', () => {
        render(
            <MemoryRouter>
                <TabelaCargosDashboard
                    cargos={[
                        {
                            id: '1',
                            name: 'Operador',
                            description: 'Linha 1',
                            createdAt: '2024-01-10T10:00:00.000Z',
                            _count: { roleEpis: 1 }
                        },
                        {
                            id: '2',
                            name: 'Auxiliar',
                            description: 'Desativado',
                            deletedAt: '2024-06-01T10:00:00.000Z',
                            createdAt: '2023-01-10T10:00:00.000Z',
                            _count: { roleEpis: 0 }
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('Ativo')).toBeInTheDocument();
        expect(screen.getByText('Inativo')).toBeInTheDocument();
    });
});
