import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { TabelaFeriasFuncionarios } from './TabelaFeriasFuncionarios.jsx';

describe('TabelaFeriasFuncionarios', () => {
    it('deve renderizar funcionários em férias', () => {
        render(
            <MemoryRouter>
                <TabelaFeriasFuncionarios
                    funcionarios={[
                        {
                            id: '1',
                            name: 'Ana Silva',
                            cpf: '123.456.789-00',
                            status: 'FERIAS',
                            leaveReturnDate: '2026-08-10',
                            company: { name: 'CVF' }
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: 'Ana Silva' })).toHaveAttribute(
            'href',
            '/admin/funcionarios/1'
        );
        expect(screen.getByText('123.456.789-00')).toBeInTheDocument();
        expect(screen.getByText('CVF')).toBeInTheDocument();
    });

    it('deve exibir traço para nome e cpf ausentes', () => {
        render(
            <MemoryRouter>
                <TabelaFeriasFuncionarios
                    funcionarios={[
                        {
                            id: '2',
                            status: 'FERIAS',
                            company: { name: 'CVF' }
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: '—' })).toBeInTheDocument();
        expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
    });

    it('deve exibir estado vazio', () => {
        render(
            <MemoryRouter>
                <TabelaFeriasFuncionarios funcionarios={[]} />
            </MemoryRouter>
        );

        expect(
            screen.getByText('Nenhum funcionário em férias encontrado com os filtros aplicados.')
        ).toBeInTheDocument();
    });
});
