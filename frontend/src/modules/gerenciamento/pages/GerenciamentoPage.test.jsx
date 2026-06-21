import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { GerenciamentoPage } from './GerenciamentoPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: () => ({
        token: 'token-teste',
        user: { id: '1', role: 'ADMINISTRATIVO' }
    })
}));

vi.mock('../../usuarios/services/usuariosApi.js', () => ({
    cadastrarUsuario: vi.fn(),
    listarUsuarios: vi.fn().mockResolvedValue([
        { id: '2', name: 'Maria', email: 'maria@teste.com', role: 'COLABORADOR' }
    ]),
    excluirUsuario: vi.fn()
}));

vi.mock('../../funcionarios/services/empresasApi.js', () => ({
    listarEmpresas: vi.fn().mockResolvedValue([{ id: '1', name: 'Empresa A' }])
}));

vi.mock('../../cargos/services/cargosApi.js', () => ({
    criarCargo: vi.fn(),
    listarCargos: vi.fn().mockResolvedValue([
        { id: '1', name: 'Operador', description: 'Linha', deletedAt: null }
    ]),
    alterarSituacaoCargo: vi.fn()
}));

vi.mock('../../empresas/services/empresasApi.js', () => ({
    criarEmpresa: vi.fn()
}));

vi.mock('../../setores/services/setoresApi.js', () => ({
    criarSetor: vi.fn()
}));

vi.mock('../../funcionarios/services/funcionariosApi.js', () => ({
    criarFuncionario: vi.fn(),
    listarFuncionarios: vi.fn().mockResolvedValue([])
}));

vi.mock('../../funcionarios/services/setoresApi.js', () => ({
    listarSetores: vi.fn().mockResolvedValue([])
}));

describe('GerenciamentoPage', () => {
    it('deve exibir painel de usuários e lista cadastrada', async () => {
        render(
            <MemoryRouter>
                <GerenciamentoPage />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: 'Gerenciamento' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Usuários' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Criar Novo Acesso' })).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: 'Usuários cadastrados' })).toBeInTheDocument();
        expect(screen.getByText('Maria')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/admin/usuarios/2');
    });

    it('deve exibir abas de cadastro de cargos, empresas, setores e funcionários', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <GerenciamentoPage />
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('button', { name: 'Cargos' }));
        expect(screen.getByRole('heading', { name: 'Cargos' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cadastrar cargo' })).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: 'Empresas' }));
        expect(screen.getByRole('heading', { name: 'Empresas' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cadastrar empresa' })).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: 'Setores' }));
        expect(screen.getByRole('heading', { name: 'Setores' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cadastrar setor' })).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: 'Funcionários' }));
        expect(screen.getByRole('heading', { name: 'Funcionários' })).toBeInTheDocument();
        expect(screen.getByText('Dados pessoais')).toBeInTheDocument();
    });
});
