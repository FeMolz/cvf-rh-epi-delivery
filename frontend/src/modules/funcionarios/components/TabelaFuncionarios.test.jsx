import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { TabelaFuncionarios } from './TabelaFuncionarios.jsx';

describe('TabelaFuncionarios', () => {
    it('deve exibir colunas da listagem', () => {
        render(
            <MemoryRouter>
                <TabelaFuncionarios
                    funcionarios={[
                        {
                            id: '1',
                            name: 'Maria',
                            status: 'ATIVO',
                            role: { name: 'Analista' },
                            company: { name: 'Empresa A' },
                            setor: { nome: 'RH' }
                        }
                    ]}
                />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: 'Maria' })).toHaveAttribute(
            'href',
            '/admin/funcionarios/1'
        );
        expect(screen.getByText('Analista')).toBeInTheDocument();
        expect(screen.getByText('Empresa A')).toBeInTheDocument();
        expect(screen.getByText('RH')).toBeInTheDocument();
        expect(screen.getByText('Ativo')).toBeInTheDocument();
    });

    it('deve alternar selecao do funcionario', async () => {
        const usuario = userEvent.setup();
        const onAlternarSelecao = vi.fn();

        render(
            <MemoryRouter>
                <TabelaFuncionarios
                    funcionarios={[
                        {
                            id: '1',
                            name: 'Maria',
                            status: 'ATIVO',
                            role: { name: 'Analista' },
                            company: { name: 'Empresa A' },
                            setor: { nome: 'RH' }
                        }
                    ]}
                    idsSelecionados={new Set()}
                    onAlternarSelecao={onAlternarSelecao}
                />
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('checkbox', { name: /selecionar maria/i }));

        expect(onAlternarSelecao).toHaveBeenCalledWith('1');
    });

    it('deve exibir estado vazio', () => {
        render(
            <MemoryRouter>
                <TabelaFuncionarios funcionarios={[]} />
            </MemoryRouter>
        );

        expect(screen.getByText(/nenhum funcionário encontrado/i)).toBeInTheDocument();
    });
});
