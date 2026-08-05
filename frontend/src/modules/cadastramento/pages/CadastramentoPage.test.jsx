import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CadastramentoPage } from './CadastramentoPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: () => ({ token: 'jwt', user: { role: 'ADMIN' } })
}));

vi.mock('../../usuarios/services/usuariosApi.js', () => ({
    cadastrarUsuario: vi.fn().mockResolvedValue({ id: '1' })
}));

vi.mock('../../cargos/services/cargosApi.js', () => ({
    listarCargos: vi.fn().mockResolvedValue([]),
    criarCargo: vi.fn()
}));

vi.mock('../../empresas/services/empresasApi.js', () => ({
    listarEmpresas: vi.fn().mockResolvedValue([]),
    criarEmpresa: vi.fn()
}));

vi.mock('../../setores/services/setoresApi.js', () => ({
    listarSetores: vi.fn().mockResolvedValue([]),
    criarSetor: vi.fn()
}));

vi.mock('../../funcionarios/services/empresasApi.js', () => ({
    listarEmpresas: vi.fn().mockResolvedValue([])
}));

vi.mock('../../funcionarios/services/setoresApi.js', () => ({
    listarSetores: vi.fn().mockResolvedValue([])
}));

vi.mock('../../funcionarios/services/funcionariosApi.js', () => ({
    criarFuncionario: vi.fn()
}));

vi.mock('../../usuarios/components/FormularioCadastroUsuario.jsx', () => ({
    FormularioCadastroUsuario: () => <p>Formulário de usuário</p>
}));

vi.mock('../../cargos/components/FormularioCargo.jsx', () => ({
    FormularioCargo: () => <p>Formulário de cargo</p>
}));

vi.mock('../../empresas/components/FormularioEmpresa.jsx', () => ({
    FormularioEmpresa: () => <p>Formulário de empresa</p>
}));

vi.mock('../../setores/components/FormularioSetor.jsx', () => ({
    FormularioSetor: () => <p>Formulário de setor</p>
}));

vi.mock('../../funcionarios/components/FormularioFuncionarioEtapa1.jsx', () => ({
    FormularioFuncionarioEtapa1: () => <p>Formulário de funcionário</p>
}));

describe('CadastramentoPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve exibir painel padrão de usuários', async () => {
        render(
            <MemoryRouter>
                <CadastramentoPage />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: 'Cadastramento' })).toBeInTheDocument();
        expect(await screen.findByText('Formulário de usuário')).toBeInTheDocument();
    });

    it('deve trocar entre abas de cadastramento', async () => {
        const usuario = userEvent.setup();

        render(
            <MemoryRouter>
                <CadastramentoPage />
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('button', { name: 'Cargos' }));
        expect(await screen.findByText('Formulário de cargo')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: 'Empresas' }));
        expect(await screen.findByText('Formulário de empresa')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: 'Setores' }));
        expect(await screen.findByText('Formulário de setor')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: 'Funcionários' }));
        expect(await screen.findByText('Formulário de funcionário')).toBeInTheDocument();
    });

    it('deve respeitar secao valida na url', async () => {
        render(
            <MemoryRouter initialEntries={['/admin/cadastramento?secao=empresas']}>
                <CadastramentoPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Formulário de empresa')).toBeInTheDocument();
        });
    });
});
