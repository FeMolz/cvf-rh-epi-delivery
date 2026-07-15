import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { TabelaSetores } from './TabelaSetores.jsx';

describe('TabelaSetores', () => {
    it('deve exibir setores com badge de status', () => {
        render(
            <MemoryRouter>
                <TabelaSetores
                    setores={[
                        {
                            id: '1',
                            nome: 'ADMINISTRATIVO',
                            isActive: true
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: 'ADMINISTRATIVO' })).toHaveAttribute(
            'href',
            '/admin/setores/1'
        );
        expect(screen.getByText('Ativo')).toHaveClass('status-badge--ativo');
    });

    it('deve exibir estado vazio', () => {
        render(
            <MemoryRouter>
                <TabelaSetores setores={[]} />
            </MemoryRouter>
        );

        expect(screen.getByText(/nenhum setor encontrado/i)).toBeInTheDocument();
    });

    it('deve exibir setor inativo com estilo adequado', () => {
        const { container } = render(
            <MemoryRouter>
                <TabelaSetores
                    setores={[
                        {
                            id: '2',
                            nome: 'INATIVO',
                            isActive: false
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('Inativo')).toHaveClass('status-badge--offline');
        expect(container.querySelector('.tabela-usuarios__linha--inativa')).toBeInTheDocument();
    });
});
