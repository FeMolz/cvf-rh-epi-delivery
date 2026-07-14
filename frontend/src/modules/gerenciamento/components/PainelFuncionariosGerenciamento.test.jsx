import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import * as MensagemFeedback from '../../../shared/components/MensagemFeedback.jsx';
import { PainelFuncionariosGerenciamento } from './PainelFuncionariosGerenciamento.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../cargos/services/cargosApi.js', () => ({
    listarCargos: vi.fn()
}));

vi.mock('../../funcionarios/services/empresasApi.js', () => ({
    listarEmpresas: vi.fn()
}));

vi.mock('../../funcionarios/services/setoresApi.js', () => ({
    listarSetores: vi.fn()
}));

vi.mock('../../funcionarios/services/funcionariosApi.js', () => ({
    criarFuncionario: vi.fn()
}));

vi.mock('../../funcionarios/components/FormularioFuncionarioEtapa1.jsx', () => ({
    FormularioFuncionarioEtapa1: ({ onContinuar, onSalvar }) => (
        <div>
            <button type="button" onClick={() => onContinuar({ name: 'João Teste' })}>
                Continuar para endereço
            </button>
            <button type="button" onClick={() => onSalvar({ name: 'João Direto' })}>
                Cadastrar da etapa 1
            </button>
        </div>
    )
}));

vi.mock('../../funcionarios/components/FormularioFuncionarioEtapa2.jsx', () => ({
    FormularioFuncionarioEtapa2: ({ onContinuar, onFinalizar, onVoltar }) => (
        <div>
            <button type="button" onClick={onVoltar}>
                Voltar etapa 1
            </button>
            <button type="button" onClick={() => onContinuar({ cep: '01310-100' })}>
                Continuar para benefícios
            </button>
            <button type="button" onClick={() => onFinalizar({ cep: '01310-200' })}>
                Finalizar da etapa 2
            </button>
        </div>
    )
}));

vi.mock('../../funcionarios/components/FormularioFuncionarioEtapa3.jsx', () => ({
    FormularioFuncionarioEtapa3: ({ onFinalizar, onVoltar }) => (
        <div>
            <button type="button" onClick={onVoltar}>
                Voltar etapa 2
            </button>
            <button type="button" onClick={() => onFinalizar({ valeTransporte: true })}>
                Finalizar cadastro
            </button>
        </div>
    )
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarCargos } = await import('../../cargos/services/cargosApi.js');
const { listarEmpresas } = await import('../../funcionarios/services/empresasApi.js');
const { listarSetores } = await import('../../funcionarios/services/setoresApi.js');
const { criarFuncionario } = await import('../../funcionarios/services/funcionariosApi.js');

describe('PainelFuncionariosGerenciamento', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarCargos.mockResolvedValue([{ id: 'cargo-1', name: 'Operador' }]);
        listarEmpresas.mockResolvedValue([{ id: 'emp-1', name: 'Empresa A', isActive: true }]);
        listarSetores.mockResolvedValue([{ id: 'set-1', nome: 'RH', isActive: true }]);
        criarFuncionario.mockResolvedValue({ id: 'func-1' });
    });

    it('deve carregar opcoes e exibir etapa inicial', async () => {
        render(
            <MemoryRouter>
                <PainelFuncionariosGerenciamento />
            </MemoryRouter>
        );

        expect(await screen.findByText('Dados pessoais')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Funcionários' })).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar carregamento das opcoes', async () => {
        listarCargos.mockRejectedValue(new Error('Erro ao carregar opções.'));

        render(
            <MemoryRouter>
                <PainelFuncionariosGerenciamento />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao carregar opções.');
    });

    it('deve percorrer etapas e cadastrar funcionario', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter initialEntries={['/admin/gerenciamento']}>
                <Routes>
                    <Route
                        path="/admin/gerenciamento"
                        element={<PainelFuncionariosGerenciamento />}
                    />
                    <Route path="/admin/funcionarios" element={<p>Lista de funcionários</p>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /continuar para endereço/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /continuar para endereço/i }));
        await usuario.click(screen.getByRole('button', { name: /continuar para benefícios/i }));
        await usuario.click(screen.getByRole('button', { name: /finalizar cadastro/i }));

        await waitFor(() => {
            expect(criarFuncionario).toHaveBeenCalled();
        });

        expect(screen.getByText('Lista de funcionários')).toBeInTheDocument();
    });

    it('deve exibir carregamento de opcoes', () => {
        listarCargos.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <PainelFuncionariosGerenciamento />
            </MemoryRouter>
        );

        expect(screen.getByText(/carregando opções do formulário/i)).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar cadastro', async () => {
        const usuario = userEvent.setup();
        criarFuncionario.mockRejectedValue(new Error('Falha no cadastro.'));

        render(
            <MemoryRouter>
                <PainelFuncionariosGerenciamento />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /continuar para endereço/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /continuar para endereço/i }));
        await usuario.click(screen.getByRole('button', { name: /continuar para benefícios/i }));
        await usuario.click(screen.getByRole('button', { name: /finalizar cadastro/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha no cadastro.');
    });

    it('deve cadastrar diretamente da etapa 1', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter initialEntries={['/admin/gerenciamento']}>
                <Routes>
                    <Route
                        path="/admin/gerenciamento"
                        element={<PainelFuncionariosGerenciamento />}
                    />
                    <Route path="/admin/funcionarios" element={<p>Lista de funcionários</p>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /cadastrar da etapa 1/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /cadastrar da etapa 1/i }));

        await waitFor(() => {
            expect(criarFuncionario).toHaveBeenCalled();
            expect(screen.getByText('Lista de funcionários')).toBeInTheDocument();
        });
    });

    it('deve finalizar cadastro da etapa 2', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter initialEntries={['/admin/gerenciamento']}>
                <Routes>
                    <Route
                        path="/admin/gerenciamento"
                        element={<PainelFuncionariosGerenciamento />}
                    />
                    <Route path="/admin/funcionarios" element={<p>Lista de funcionários</p>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /continuar para endereço/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /continuar para endereço/i }));
        await usuario.click(screen.getByRole('button', { name: /finalizar da etapa 2/i }));

        await waitFor(() => {
            expect(criarFuncionario).toHaveBeenCalled();
        });
    });

    it('deve voltar entre etapas do cadastro', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <PainelFuncionariosGerenciamento />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /continuar para endereço/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /continuar para endereço/i }));
        await usuario.click(screen.getByRole('button', { name: /voltar etapa 1/i }));
        await usuario.click(screen.getByRole('button', { name: /continuar para endereço/i }));
        await usuario.click(screen.getByRole('button', { name: /continuar para benefícios/i }));
        await usuario.click(screen.getByRole('button', { name: /voltar etapa 2/i }));

        expect(screen.getByRole('button', { name: /continuar para benefícios/i })).toBeInTheDocument();
    });

    it('deve usar mensagem padrao quando carregamento falhar sem message', async () => {
        listarCargos.mockRejectedValue({});

        render(
            <MemoryRouter>
                <PainelFuncionariosGerenciamento />
            </MemoryRouter>
        );

        expect(await screen.findByRole('alert')).toHaveTextContent(
            /não foi possível carregar empresas, cargos e setores/i
        );
    });

    it('nao deve atualizar estado apos desmontar durante carregamento', async () => {
        let resolver;
        listarCargos.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        );

        const { unmount } = render(
            <MemoryRouter>
                <PainelFuncionariosGerenciamento />
            </MemoryRouter>
        );

        unmount();

        resolver([]);
        await act(async () => {
            await Promise.resolve();
        });
    });

    it('deve exibir erro padrao ao falhar cadastro sem message', async () => {
        const usuario = userEvent.setup();
        criarFuncionario.mockRejectedValueOnce({});

        render(
            <MemoryRouter>
                <PainelFuncionariosGerenciamento />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /cadastrar da etapa 1/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /cadastrar da etapa 1/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            /não foi possível cadastrar o funcionário/i
        );
    });

    it('deve limpar erro via callback do feedback', async () => {
        const original = MensagemFeedback.AreaMensagensFeedback;
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.erro && props.onLimparErro) {
                props.onLimparErro();
            }

            return original(props);
        });

        listarCargos.mockRejectedValue(new Error('Falha ao carregar.'));

        render(
            <MemoryRouter>
                <PainelFuncionariosGerenciamento />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });
});
