import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { TabelaEmpresas } from './TabelaEmpresas.jsx';

describe('TabelaEmpresas', () => {
    it('deve exibir empresas com CNPJ e badge de status', () => {
        render(
            <MemoryRouter>
                <TabelaEmpresas
                    empresas={[
                        {
                            id: '1',
                            name: 'Empresa 01',
                            cnpj: '12.345.678/0001-99',
                            isActive: true
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: 'Empresa 01' })).toHaveAttribute(
            'href',
            '/admin/empresas/1'
        );
        expect(screen.getByText('12.345.678/0001-99')).toBeInTheDocument();
        expect(screen.getByText('Ativa')).toHaveClass('status-badge--ativo');
    });

    it('deve exibir estado vazio', () => {
        render(
            <MemoryRouter>
                <TabelaEmpresas empresas={[]} />
            </MemoryRouter>
        );

        expect(screen.getByText(/nenhuma empresa encontrada/i)).toBeInTheDocument();
    });

    it('deve exibir empresa inativa com estilo adequado', () => {
        const { container } = render(
            <MemoryRouter>
                <TabelaEmpresas
                    empresas={[
                        {
                            id: '2',
                            name: 'Empresa Inativa',
                            cnpj: '98.765.432/0001-10',
                            isActive: false
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('Inativa')).toHaveClass('status-badge--offline');
        expect(container.querySelector('.tabela-usuarios__linha--inativa')).toBeInTheDocument();
    });
});
