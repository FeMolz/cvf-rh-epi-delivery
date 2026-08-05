import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { ListagemFuncionariosPage } from './ListagemFuncionariosPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/empresasApi.js', () => ({
    listarEmpresas: vi.fn()
}));

vi.mock('../services/funcionariosApi.js', () => ({
    listarFuncionarios: vi.fn(),
    baixarRelatorioFuncionarios: vi.fn()
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarEmpresas } = await import('../services/empresasApi.js');
const { listarFuncionarios, baixarRelatorioFuncionarios } = await import(
    '../services/funcionariosApi.js'
);

const empresasMock = [
    { id: 'emp-1', name: 'Empresa A', isActive: true },
    { id: 'emp-2', name: 'Empresa B', isActive: true }
];

const funcionariosMock = [
    {
        id: '1',
        name: 'Maria',
        status: 'ATIVO',
        companyId: 'emp-1',
        role: { name: 'Analista' },
        company: { name: 'Empresa A' },
        setor: { nome: 'RH' }
    },
    {
        id: '2',
        name: 'João',
        status: 'DESLIGADO',
        companyId: 'emp-2',
        role: { name: 'Operador' },
        company: { name: 'Empresa B' },
        setor: { nome: 'Produção' }
    },
    ...Array.from({ length: 10 }, (_, indice) => ({
        id: String(indice + 3),
        name: `Funcionário ${indice + 3}`,
        status: 'ATIVO',
        companyId: 'emp-1',
        role: { name: 'Analista' },
        company: { name: 'Empresa A' },
        setor: { nome: 'RH' }
    }))
];

describe('ListagemFuncionariosPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarEmpresas.mockResolvedValue(empresasMock);
        listarFuncionarios.mockResolvedValue(funcionariosMock);
        baixarRelatorioFuncionarios.mockResolvedValue(undefined);
    });

    it('deve carregar funcionarios e estatisticas da empresa ativa', async () => {
        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: 'Funcionários' })).toBeInTheDocument();
        expect(screen.getByText('Total cadastrados')).toBeInTheDocument();
        expect(screen.getAllByText('11')).toHaveLength(2);
        expect(screen.queryByText('João')).not.toBeInTheDocument();
    });

    it('deve filtrar funcionarios por busca e trocar empresa', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        await usuario.type(
            screen.getByRole('searchbox', { name: /pesquisar funcionários/i }),
            'maria'
        );

        expect(screen.getByText('Maria')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: 'Empresa B' }));

        await waitFor(() => {
            expect(screen.getByText('João')).toBeInTheDocument();
        });

        expect(screen.queryByText('Maria')).not.toBeInTheDocument();
    });

    it('deve baixar relatorio da empresa e fichas selecionadas', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /download relatório da empresa/i }));

        expect(baixarRelatorioFuncionarios).toHaveBeenCalledWith('jwt', {
            filtro: 'todos',
            companyId: 'emp-1'
        });

        await usuario.click(screen.getByRole('checkbox', { name: /selecionar maria/i }));
        await usuario.click(screen.getByRole('button', { name: /download ficha/i }));

        expect(baixarRelatorioFuncionarios).toHaveBeenLastCalledWith('jwt', { ids: ['1'] });
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        listarFuncionarios.mockRejectedValue(new Error('Erro ao carregar.'));

        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao carregar.');
    });

    it('deve exibir estado vazio sem empresas cadastradas', async () => {
        listarEmpresas.mockResolvedValue([]);

        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        expect(await screen.findByText(/nenhuma empresa cadastrada/i)).toBeInTheDocument();
    });

    it('deve paginar funcionarios e selecionar todos', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        expect(screen.getByText('Funcionário 12')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /anterior/i }));
        expect(screen.getByText('Maria')).toBeInTheDocument();

        await usuario.click(screen.getByRole('checkbox', { name: /selecionar todos/i }));
        await usuario.click(screen.getByRole('button', { name: /download fichas/i }));

        expect(baixarRelatorioFuncionarios).toHaveBeenLastCalledWith(
            'jwt',
            expect.objectContaining({ ids: expect.any(Array) })
        );
    });

    it('deve desmarcar funcionario selecionado', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        const checkboxMaria = screen.getByRole('checkbox', { name: /selecionar maria/i });
        await usuario.click(checkboxMaria);
        await usuario.click(checkboxMaria);

        expect(screen.getByRole('button', { name: /download relatório da empresa/i })).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar download do relatorio', async () => {
        const usuario = userEvent.setup();
        baixarRelatorioFuncionarios.mockRejectedValue(new Error('Falha no download.'));

        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /download relatório da empresa/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha no download.');
    });

    it('deve exibir erro generico ao falhar carregamento', async () => {
        listarFuncionarios.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível carregar os funcionários.'
        );
    });

    it('deve limpar mensagem de erro automaticamente', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        listarFuncionarios.mockRejectedValue(new Error('Erro temporário'));

        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        expect(await screen.findByText('Erro temporário')).toBeInTheDocument();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(5000);
        });

        expect(screen.queryByText('Erro temporário')).not.toBeInTheDocument();
        vi.useRealTimers();
    });

    it('deve desmarcar todos, exibir rotulos de download e validar exportacao', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('checkbox', { name: /selecionar todos/i }));
        expect(screen.getByRole('button', { name: /download fichas/i })).toBeInTheDocument();

        await usuario.click(screen.getByRole('checkbox', { name: /selecionar todos/i }));
        expect(screen.getByRole('button', { name: /download relatório da empresa/i })).toBeInTheDocument();
    });

    it('deve validar exportacao sem empresa ativa e exibir rotulo ao baixar ficha', async () => {
        const usuario = userEvent.setup();
        listarEmpresas.mockResolvedValue([{ id: 'emp-inativa', name: 'Empresa Inativa', isActive: false }]);
        listarFuncionarios.mockResolvedValue([]);

        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        expect(await screen.findByText(/nenhuma empresa cadastrada/i)).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /download relatório da empresa/i }));

        expect(
            await screen.findByText(/selecione uma empresa ou marque ao menos um funcionário/i)
        ).toBeInTheDocument();
    });

    it('deve exibir rotulo de download ao baixar ficha selecionada', async () => {
        const usuario = userEvent.setup();
        let resolver;
        baixarRelatorioFuncionarios.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        );

        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('checkbox', { name: /selecionar maria/i }));
        await usuario.click(screen.getByRole('button', { name: /download ficha/i }));

        expect(screen.getByRole('button', { name: /baixando ficha/i })).toBeDisabled();

        resolver();
    });

    it('deve exibir erro generico ao falhar download do relatorio', async () => {
        const usuario = userEvent.setup();
        baixarRelatorioFuncionarios.mockRejectedValue(new Error());

        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /download relatório da empresa/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível baixar o relatório/i);
    });

    it('deve preservar empresa ativa ao recarregar dados', async () => {
        const view = render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        useAuth.mockReturnValue({ token: 'jwt-novo' });
        view.rerender(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(listarFuncionarios).toHaveBeenCalledWith('jwt-novo', { filtro: 'todos' });
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });
    });

    it('deve usar rotulo padrao para empresa sem nome', async () => {
        listarEmpresas.mockResolvedValue([{ id: 'emp-1', name: null, isActive: true }]);

        render(
            <MemoryRouter>
                <ListagemFuncionariosPage />
            </MemoryRouter>
        );

        expect(await screen.findByRole('button', { name: 'Empresa' })).toBeInTheDocument();
    });
});
