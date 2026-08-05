import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { PainelFuncionariosDp } from './PainelFuncionariosDp.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../funcionarios/services/empresasApi.js', () => ({
    listarEmpresas: vi.fn()
}));

vi.mock('../../setores/services/setoresApi.js', () => ({
    listarSetores: vi.fn()
}));

vi.mock('../../cargos/services/cargosApi.js', () => ({
    listarCargos: vi.fn()
}));

vi.mock('../../funcionarios/services/funcionariosApi.js', () => ({
    consultarFuncionarios: vi.fn(),
    baixarRelatorioFuncionarios: vi.fn()
}));

vi.mock('../../../shared/components/MensagemFeedback.jsx', () => ({
    AreaMensagensFeedback: ({ erro = '', onLimparErro }) =>
        erro ? (
            <div>
                <p role="alert">{erro}</p>
                <button type="button" onClick={onLimparErro}>
                    limpar-erro
                </button>
            </div>
        ) : null
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarEmpresas } = await import('../../funcionarios/services/empresasApi.js');
const { listarSetores } = await import('../../setores/services/setoresApi.js');
const { listarCargos } = await import('../../cargos/services/cargosApi.js');
const { consultarFuncionarios, baixarRelatorioFuncionarios } = await import(
    '../../funcionarios/services/funcionariosApi.js'
);

const funcionariosMock = [
    {
        id: '1',
        name: 'Ana',
        cpf: '111',
        status: 'ATIVO',
        company: { name: 'CVF' },
        role: { name: 'Analista' },
        setor: { nome: 'RH' }
    },
    ...Array.from({ length: 10 }, (_, indice) => ({
        id: String(indice + 2),
        name: `Funcionário ${indice + 2}`,
        cpf: `222${indice}`,
        status: 'ATIVO',
        company: { name: 'CVF' },
        role: { name: 'Operador' },
        setor: { nome: 'Produção' }
    }))
];

describe('PainelFuncionariosDp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarEmpresas.mockResolvedValue([{ id: 'emp-1', name: 'CVF', isActive: true }]);
        listarSetores.mockResolvedValue([{ id: 'setor-1', nome: 'RH', isActive: true }]);
        listarCargos.mockResolvedValue([{ id: 'cargo-1', name: 'Analista' }]);
        consultarFuncionarios.mockResolvedValue(funcionariosMock);
        baixarRelatorioFuncionarios.mockResolvedValue(undefined);
    });

    it('deve aceitar listas nulas de setores e cargos ao carregar filtros', async () => {
        listarSetores.mockResolvedValue(null);
        listarCargos.mockResolvedValue(null);

        render(
            <MemoryRouter>
                <PainelFuncionariosDp />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        expect(screen.getByLabelText(/^setor$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^cargo$/i)).toBeInTheDocument();
    });

    it('deve carregar funcionários com filtros padrão', async () => {
        render(
            <MemoryRouter>
                <PainelFuncionariosDp />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        expect(consultarFuncionarios).toHaveBeenCalledWith('jwt', expect.objectContaining({ situacao: 'ativos' }));

        // Dispara o debounce inicial com busca inalterada (early-return).
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 450));
        });
    });

    it('deve aplicar filtros e baixar relatório', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <PainelFuncionariosDp />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText('Situação'), 'demitidos');

        await waitFor(() => {
            expect(consultarFuncionarios).toHaveBeenLastCalledWith(
                'jwt',
                expect.objectContaining({ situacao: 'demitidos' })
            );
        });

        await usuario.click(screen.getByRole('button', { name: 'Download relatório' }));

        await waitFor(() => {
            expect(baixarRelatorioFuncionarios).toHaveBeenCalledWith('jwt', {
                filtro: 'inativos',
                companyId: undefined
            });
        });
    });

    it('deve baixar relatório dos selecionados', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <PainelFuncionariosDp />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('checkbox', { name: /selecionar ana/i }));
        await usuario.click(screen.getByRole('button', { name: 'Download relatório' }));

        await waitFor(() => {
            expect(baixarRelatorioFuncionarios).toHaveBeenCalledWith('jwt', { ids: ['1'] });
        });
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        consultarFuncionarios.mockRejectedValue(new Error('Falha na consulta'));

        render(
            <MemoryRouter>
                <PainelFuncionariosDp />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha na consulta');
    });

    it('deve exibir erro generico ao falhar carregamento', async () => {
        consultarFuncionarios.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <PainelFuncionariosDp />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os funcionários.');
    });

    it('deve exibir erro ao falhar download', async () => {
        const usuario = userEvent.setup();
        baixarRelatorioFuncionarios.mockRejectedValue(new Error('Falha no download'));

        render(
            <MemoryRouter>
                <PainelFuncionariosDp />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: 'Download relatório' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha no download');
    });

    it('deve ignorar falha ao carregar empresas', async () => {
        listarEmpresas.mockRejectedValue(new Error('Falha empresas'));

        render(
            <MemoryRouter>
                <PainelFuncionariosDp />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });
    });

    it('deve paginar, selecionar todos e preencher filtros avançados', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <PainelFuncionariosDp />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        await usuario.selectOptions(screen.getByLabelText('Empresa'), 'emp-1');
        await usuario.selectOptions(screen.getByLabelText('Setor'), 'setor-1');
        await usuario.selectOptions(screen.getByLabelText('Cargo'), 'cargo-1');
        await usuario.selectOptions(screen.getByLabelText('Situação'), 'todos');
        await usuario.type(screen.getByLabelText('Admissão de'), '2024-01-01');
        await usuario.type(screen.getByLabelText('Admissão até'), '2024-12-31');
        await usuario.selectOptions(screen.getByLabelText('Ordenação por admissão'), 'antigas');

        await waitFor(() => {
            expect(consultarFuncionarios).toHaveBeenLastCalledWith(
                'jwt',
                expect.objectContaining({
                    companyId: 'emp-1',
                    setorId: 'setor-1',
                    roleId: 'cargo-1',
                    situacao: 'todos',
                    admissaoDe: '2024-01-01',
                    admissaoAte: '2024-12-31',
                    ordenacaoAdmissao: 'antigas'
                })
            );
        });

        await usuario.type(screen.getByLabelText(/funcionário \(nome ou cpf\)/i), 'Ana');

        await waitFor(
            () => {
                expect(consultarFuncionarios).toHaveBeenLastCalledWith(
                    'jwt',
                    expect.objectContaining({
                        companyId: 'emp-1',
                        busca: 'Ana',
                        situacao: 'todos',
                        admissaoDe: '2024-01-01',
                        admissaoAte: '2024-12-31',
                        ordenacaoAdmissao: 'antigas'
                    })
                );
            },
            { timeout: 2000 }
        );

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        expect(screen.getByText('Funcionário 11')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /anterior/i }));
        expect(screen.getByText('Ana')).toBeInTheDocument();

        await usuario.click(screen.getByRole('checkbox', { name: /selecionar todos/i }));
        await usuario.click(screen.getByRole('checkbox', { name: /selecionar todos/i }));
    });

    it('deve desmarcar funcionário selecionado e baixar por empresa', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <PainelFuncionariosDp />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('checkbox', { name: /selecionar ana/i }));
        await usuario.click(screen.getByRole('checkbox', { name: /selecionar ana/i }));

        await usuario.selectOptions(screen.getByLabelText('Empresa'), 'emp-1');

        await waitFor(() => {
            expect(consultarFuncionarios).toHaveBeenLastCalledWith(
                'jwt',
                expect.objectContaining({ companyId: 'emp-1' })
            );
        });

        await usuario.click(screen.getByRole('button', { name: 'Download relatório' }));

        await waitFor(() => {
            expect(baixarRelatorioFuncionarios).toHaveBeenCalledWith('jwt', {
                filtro: 'todos',
                companyId: 'emp-1'
            });
        });
    });

    it('deve limpar mensagem de erro manualmente', async () => {
        const usuario = userEvent.setup();
        consultarFuncionarios.mockRejectedValue(new Error('Falha na consulta'));

        render(
            <MemoryRouter>
                <PainelFuncionariosDp />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha na consulta');

        await usuario.click(screen.getByRole('button', { name: 'limpar-erro' }));

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('deve limpar filtros de busca e situacao', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <PainelFuncionariosDp />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        await usuario.type(screen.getByPlaceholderText(/buscar por nome ou cpf/i), 'Ana');
        await usuario.selectOptions(screen.getByLabelText(/^situação$/i), 'demitidos');
        await usuario.click(screen.getByRole('button', { name: /limpar filtros/i }));

        expect(screen.getByPlaceholderText(/buscar por nome ou cpf/i)).toHaveValue('');
        expect(screen.getByLabelText(/^situação$/i)).toHaveValue('ativos');
    });

    it('deve exibir erro generico ao falhar download', async () => {
        const usuario = userEvent.setup();
        baixarRelatorioFuncionarios.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <PainelFuncionariosDp />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ana')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: 'Download relatório' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível baixar o relatório.');
    });
});
