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
                    onAlternarSelecaoTodos={vi.fn()}
                />
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('checkbox', { name: /selecionar maria/i }));

        expect(onAlternarSelecao).toHaveBeenCalledWith('1');
    });

    it('deve selecionar e desmarcar todos os funcionarios visiveis', async () => {
        const usuario = userEvent.setup();
        const onAlternarSelecaoTodos = vi.fn();
        const funcionarios = [
            {
                id: '1',
                name: 'Maria',
                status: 'ATIVO',
                role: { name: 'Analista' },
                company: { name: 'Empresa A' },
                setor: { nome: 'RH' }
            },
            {
                id: '2',
                name: 'João',
                status: 'ATIVO',
                role: { name: 'Técnico' },
                company: { name: 'Empresa A' },
                setor: { nome: 'TI' }
            }
        ];

        const { rerender } = render(
            <MemoryRouter>
                <TabelaFuncionarios
                    funcionarios={funcionarios}
                    idsSelecionados={new Set()}
                    onAlternarSelecao={vi.fn()}
                    onAlternarSelecaoTodos={onAlternarSelecaoTodos}
                />
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('checkbox', { name: /selecionar todos/i }));

        expect(onAlternarSelecaoTodos).toHaveBeenCalledWith(['1', '2'], true);

        rerender(
            <MemoryRouter>
                <TabelaFuncionarios
                    funcionarios={funcionarios}
                    idsSelecionados={new Set(['1', '2'])}
                    onAlternarSelecao={vi.fn()}
                    onAlternarSelecaoTodos={onAlternarSelecaoTodos}
                />
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('checkbox', { name: /selecionar todos/i }));

        expect(onAlternarSelecaoTodos).toHaveBeenLastCalledWith(['1', '2'], false);
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
