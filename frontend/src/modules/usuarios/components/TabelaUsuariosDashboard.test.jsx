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

    it('deve exibir estado vazio', () => {
        render(
            <MemoryRouter>
                <TabelaUsuariosDashboard usuarios={[]} />
            </MemoryRouter>
        );

        expect(
            screen.getByText('Nenhum usuário encontrado para os filtros aplicados.')
        ).toBeInTheDocument();
    });

    it('deve gerar iniciais a partir do nome completo', () => {
        render(
            <MemoryRouter>
                <TabelaUsuariosDashboard
                    usuarios={[
                        {
                            id: '4',
                            name: 'Ana Paula Costa',
                            email: 'ana@b.com',
                            role: 'ADMIN',
                            isActive: true
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('AP')).toBeInTheDocument();
    });

    it('deve usar iniciais padrao e papel desconhecido', () => {
        render(
            <MemoryRouter>
                <TabelaUsuariosDashboard
                    usuarios={[
                        {
                            id: '3',
                            name: '',
                            email: 'x@y.com',
                            role: 'PAPEL_X',
                            isActive: true
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('?')).toBeInTheDocument();
        expect(screen.getByText('PAPEL_X')).toBeInTheDocument();
    });
});
