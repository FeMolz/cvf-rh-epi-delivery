import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { GerenciamentoPage } from './GerenciamentoPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: () => ({
        token: 'token-teste',
        user: { id: '1', role: 'ADMINISTRATIVO' }
    })
}));

vi.mock('../../usuarios/services/usuariosApi.js', () => ({
    listarUsuarios: vi.fn().mockResolvedValue([
        { id: '2', name: 'Maria', email: 'maria@teste.com', role: 'COLABORADOR' }
    ]),
    excluirUsuario: vi.fn()
}));

vi.mock('../../funcionarios/services/empresasApi.js', () => ({
    listarEmpresas: vi.fn().mockResolvedValue([{ id: '1', name: 'Empresa A' }])
}));

vi.mock('../../cargos/services/cargosApi.js', () => ({
    listarCargos: vi.fn(),
    baixarRelatorioCargos: vi.fn()
}));

vi.mock('../../empresas/services/empresasApi.js', () => ({
    listarEmpresas: vi.fn()
}));

vi.mock('../../setores/services/setoresApi.js', () => ({
    listarSetores: vi.fn()
}));

const { listarCargos, baixarRelatorioCargos } = await import('../../cargos/services/cargosApi.js');
const { listarEmpresas: listarEmpresasModulo } = await import('../../empresas/services/empresasApi.js');
const { listarSetores } = await import('../../setores/services/setoresApi.js');

describe('GerenciamentoPage', () => {
    beforeEach(() => {
        listarCargos.mockResolvedValue([
            {
                id: '1',
                name: 'Operador',
                description: 'Linha',
                deletedAt: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                _count: { roleEpis: 0 }
            }
        ]);
        baixarRelatorioCargos.mockResolvedValue(undefined);
        listarEmpresasModulo.mockResolvedValue([
            {
                id: '1',
                name: 'Empresa A',
                cnpj: '00.000.000/0001-00',
                isActive: true
            }
        ]);
        listarSetores.mockResolvedValue([{ id: '1', nome: 'Produção', isActive: true }]);
    });
    it('deve exibir painel de visualização de usuários', async () => {
        render(
            <MemoryRouter>
                <GerenciamentoPage />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: 'Gerenciamento' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Usuários' })).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: 'Usuários cadastrados' })).toBeInTheDocument();
        expect(screen.getByText('Maria')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/admin/usuarios/2');
    });

    it('deve exibir abas de visualização de cargos, empresas e setores', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <GerenciamentoPage />
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('button', { name: 'Cargos' }));
        expect(await screen.findByRole('heading', { name: 'Cargos ativos' })).toBeInTheDocument();
        expect(await screen.findByText('Operador')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: 'Empresas' }));
        expect(await screen.findByRole('heading', { name: 'Empresas ativas' })).toBeInTheDocument();
        expect(await screen.findByText('Empresa A')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: 'Setores' }));
        expect(await screen.findByRole('heading', { name: 'Setores ativos' })).toBeInTheDocument();
        expect(await screen.findByText('Produção')).toBeInTheDocument();
    });
});
