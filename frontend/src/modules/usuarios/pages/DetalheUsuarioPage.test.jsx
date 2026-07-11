import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DetalheUsuarioPage } from './DetalheUsuarioPage.jsx';

const navegarMock = vi.fn();

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../services/usuariosApi.js', () => ({
    buscarUsuarioPorId: vi.fn(),
    atualizarUsuario: vi.fn(),
    excluirUsuario: vi.fn()
}));

vi.mock('react-router-dom', async () => {
    const atual = await vi.importActual('react-router-dom');
    return {
        ...atual,
        useNavigate: () => navegarMock
    };
});

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { buscarUsuarioPorId, atualizarUsuario, excluirUsuario } = await import(
    '../services/usuariosApi.js'
);

const usuarioBase = {
    id: 'usuario-2',
    name: 'Maria Silva',
    email: 'maria@teste.com',
    role: 'COLABORADOR',
    isActive: true,
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-06-01T12:00:00.000Z',
    lastLogin: '2025-06-10T08:00:00.000Z'
};

function renderizarDetalhe(id = 'usuario-2') {
    return render(
        <MemoryRouter initialEntries={[`/admin/usuarios/${id}`]}>
            <Routes>
                <Route path="/admin/usuarios/:id" element={<DetalheUsuarioPage />} />
                <Route path="/admin/gerenciamento" element={<p>Gerenciamento</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('DetalheUsuarioPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        navegarMock.mockClear();
        useAuth.mockReturnValue({
            token: 'jwt-admin',
            user: { id: 'usuario-1', role: 'ADMIN' }
        });
        buscarUsuarioPorId.mockResolvedValue({ ...usuarioBase });
    });

    it('deve exibir estado de carregamento', () => {
        buscarUsuarioPorId.mockImplementation(() => new Promise(() => {}));

        renderizarDetalhe();

        expect(screen.getByText(/carregando usuário/i)).toBeInTheDocument();
    });

    it('deve exibir erro quando usuário não é encontrado', async () => {
        buscarUsuarioPorId.mockRejectedValue(new Error('Usuário não encontrado.'));

        renderizarDetalhe();

        expect(await screen.findByRole('alert')).toHaveTextContent('Usuário não encontrado.');
        expect(screen.getByRole('link', { name: /voltar ao gerenciamento/i })).toHaveAttribute(
            'href',
            '/admin/gerenciamento'
        );
    });

    it('deve exibir erro generico quando busca falhar sem mensagem', async () => {
        buscarUsuarioPorId.mockRejectedValue(new Error());

        renderizarDetalhe();

        expect(await screen.findByRole('alert')).toHaveTextContent('Usuário não encontrado.');
    });

    it('deve exibir dados e salvar alterações', async () => {
        const usuario = userEvent.setup();
        atualizarUsuario.mockResolvedValue({
            ...usuarioBase,
            name: 'Maria Atualizada',
            email: 'maria.nova@teste.com'
        });

        renderizarDetalhe();

        expect(await screen.findByRole('heading', { name: 'Maria Silva' })).toBeInTheDocument();
        expect(screen.getByText('Online')).toBeInTheDocument();

        await usuario.clear(screen.getByLabelText(/nome completo/i));
        await usuario.type(screen.getByLabelText(/nome completo/i), 'Maria Atualizada');
        await usuario.clear(screen.getByLabelText(/^e-mail$/i));
        await usuario.type(screen.getByLabelText(/^e-mail$/i), 'maria.nova@teste.com');
        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        await waitFor(() => {
            expect(screen.getByText('Usuário atualizado com sucesso.')).toBeInTheDocument();
        });

        expect(atualizarUsuario).toHaveBeenCalledWith(
            'usuario-2',
            {
                name: 'Maria Atualizada',
                email: 'maria.nova@teste.com',
                role: 'COLABORADOR'
            },
            'jwt-admin'
        );
    });

    it('deve exibir erro ao salvar alterações', async () => {
        const usuario = userEvent.setup();
        atualizarUsuario.mockRejectedValue(new Error('E-mail já cadastrado.'));

        renderizarDetalhe();

        await screen.findByRole('heading', { name: 'Maria Silva' });
        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('E-mail já cadastrado.');
    });

    it('deve exibir erro generico ao salvar alterações', async () => {
        const usuario = userEvent.setup();
        atualizarUsuario.mockRejectedValue(new Error());

        renderizarDetalhe();

        await screen.findByRole('heading', { name: 'Maria Silva' });
        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível salvar as alterações.'
        );
    });

    it('deve excluir usuário após confirmação', async () => {
        const usuario = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        excluirUsuario.mockResolvedValue(undefined);

        renderizarDetalhe();

        await screen.findByRole('heading', { name: 'Maria Silva' });
        await usuario.click(screen.getByRole('button', { name: /excluir usuário/i }));

        await waitFor(() => {
            expect(excluirUsuario).toHaveBeenCalledWith('usuario-2', 'jwt-admin');
            expect(navegarMock).toHaveBeenCalledWith('/admin/gerenciamento');
        });

        confirmSpy.mockRestore();
    });

    it('não deve excluir quando confirmação é cancelada', async () => {
        const usuario = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        renderizarDetalhe();

        await screen.findByRole('heading', { name: 'Maria Silva' });
        await usuario.click(screen.getByRole('button', { name: /excluir usuário/i }));

        expect(excluirUsuario).not.toHaveBeenCalled();
        confirmSpy.mockRestore();
    });

    it('deve exibir erro generico ao falhar exclusão', async () => {
        const usuario = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        excluirUsuario.mockRejectedValue(new Error());

        renderizarDetalhe();

        await screen.findByRole('heading', { name: 'Maria Silva' });
        await usuario.click(screen.getByRole('button', { name: /excluir usuário/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível excluir o usuário.'
        );
        confirmSpy.mockRestore();
    });

    it('deve exibir erro ao falhar exclusão', async () => {
        const usuario = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        excluirUsuario.mockRejectedValue(new Error('Não foi possível excluir.'));

        renderizarDetalhe();

        await screen.findByRole('heading', { name: 'Maria Silva' });
        await usuario.click(screen.getByRole('button', { name: /excluir usuário/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível excluir.');
        confirmSpy.mockRestore();
    });

    it('deve impedir exclusão do próprio usuário', async () => {
        useAuth.mockReturnValue({
            token: 'jwt-admin',
            user: { id: 'usuario-2', role: 'ADMIN' }
        });

        renderizarDetalhe();

        await screen.findByRole('heading', { name: 'Maria Silva' });

        expect(screen.getByRole('button', { name: /excluir usuário/i })).toBeDisabled();
        expect(
            screen.getByText(/você não pode excluir a própria conta por aqui/i)
        ).toBeInTheDocument();
    });

    it('deve desabilitar papel de administrador para não-admin', async () => {
        buscarUsuarioPorId.mockResolvedValue({
            ...usuarioBase,
            role: 'ADMIN'
        });
        useAuth.mockReturnValue({
            token: 'jwt-admin',
            user: { id: 'usuario-1', role: 'ADMINISTRATIVO' }
        });

        renderizarDetalhe();

        await screen.findByRole('heading', { name: 'Maria Silva' });

        expect(screen.getByLabelText(/permissão/i)).toBeDisabled();
    });

    it('deve exibir status offline com último login', async () => {
        buscarUsuarioPorId.mockResolvedValue({
            ...usuarioBase,
            isActive: false
        });

        renderizarDetalhe();

        await screen.findByRole('heading', { name: 'Maria Silva' });

        expect(screen.getByText(/offline · último login/i)).toBeInTheDocument();
    });

    it('deve ignorar atualização após desmontagem', async () => {
        let resolver;
        buscarUsuarioPorId.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        );

        const { unmount } = renderizarDetalhe();
        unmount();

        resolver({ ...usuarioBase });

        await waitFor(() => {
            expect(buscarUsuarioPorId).toHaveBeenCalled();
        });
    });

    it('deve limpar mensagens de feedback apos timeout', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });

        const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        atualizarUsuario.mockResolvedValue({
            ...usuarioBase,
            name: 'Maria Atualizada'
        });

        renderizarDetalhe();
        await screen.findByRole('heading', { name: 'Maria Silva' });

        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        await waitFor(() => {
            expect(screen.getByText('Usuário atualizado com sucesso.')).toBeInTheDocument();
        });

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        await waitFor(() => {
            expect(screen.queryByText('Usuário atualizado com sucesso.')).not.toBeInTheDocument();
        });

        vi.useRealTimers();
    });

    it('deve exibir usuario sem nome nos metadados', async () => {
        buscarUsuarioPorId.mockResolvedValue({
            ...usuarioBase,
            name: null,
            email: null
        });

        renderizarDetalhe();

        expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('');
    });

    it('deve exibir mensagem padrao quando busca falhar sem mensagem util', async () => {
        buscarUsuarioPorId.mockRejectedValue({});

        renderizarDetalhe();

        expect(await screen.findByRole('alert')).toHaveTextContent('Usuário não encontrado.');
    });

    it('deve tratar usuario sem papel ao carregar', async () => {
        buscarUsuarioPorId.mockResolvedValue({
            ...usuarioBase,
            role: null
        });

        renderizarDetalhe();

        expect(await screen.findByRole('heading', { name: 'Maria Silva' })).toBeInTheDocument();
    });

    it('deve alterar papel e limpar mensagem de erro', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        atualizarUsuario.mockRejectedValueOnce(new Error('Falha ao salvar'));

        renderizarDetalhe();
        await screen.findByRole('heading', { name: 'Maria Silva' });

        await usuario.selectOptions(screen.getByLabelText(/permissão/i), 'ADMINISTRATIVO');
        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao salvar');

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        vi.useRealTimers();
    });
});
