import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { TabelaUsuariosDashboard } from './TabelaUsuariosDashboard.jsx';

describe('TabelaUsuariosDashboard', () => {
    it('deve exibir online ou último login', () => {
        render(
            <MemoryRouter>
                <TabelaUsuariosDashboard
                    usuarios={[
                        {
                            id: '1',
                            name: 'Ana',
                            email: 'ana@b.com',
                            role: 'ADMIN',
                            isActive: true
                        },
                        {
                            id: '2',
                            name: 'Bruno',
                            email: 'bruno@b.com',
                            role: 'COLABORADOR',
                            isActive: false,
                            lastLogin: '2026-06-15T10:00:00.000Z'
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('Online')).toBeInTheDocument();
        expect(screen.getByText(/Offline ·/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Ana/i })).toHaveAttribute('href', '/admin/usuarios/1');
    });
});
