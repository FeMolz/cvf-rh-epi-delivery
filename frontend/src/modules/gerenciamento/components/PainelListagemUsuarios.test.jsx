import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PainelListagemUsuarios } from './PainelListagemUsuarios.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../usuarios/services/usuariosApi.js', () => ({
    listarUsuarios: vi.fn()
}));

vi.mock('../../funcionarios/services/empresasApi.js', () => ({
    listarEmpresas: vi.fn()
}));

vi.mock('./ListaUsuariosCadastrados.jsx', () => ({
    ListaUsuariosCadastrados: ({ usuarios, totalEmpresas, onUsuarioRemovido }) => (
        <div>
            <p>Total empresas: {totalEmpresas}</p>
            {usuarios.map((usuario) => (
                <p key={usuario.id}>{usuario.name}</p>
            ))}
            <button type="button" onClick={onUsuarioRemovido}>
                Recarregar usuários
            </button>
        </div>
    )
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarUsuarios } = await import('../../usuarios/services/usuariosApi.js');
const { listarEmpresas } = await import('../../funcionarios/services/empresasApi.js');

describe('PainelListagemUsuarios', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt', user: { id: '1', role: 'ADMIN' } });
        listarUsuarios.mockResolvedValue([{ id: '2', name: 'Maria', email: 'maria@teste.com' }]);
        listarEmpresas.mockResolvedValue([{ id: 'emp-1' }, { id: 'emp-2' }]);
    });

    it('deve listar usuários e total de empresas', async () => {
        render(<PainelListagemUsuarios />);

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        expect(screen.getByText('1 usuário com acesso ao portal.')).toBeInTheDocument();
        expect(screen.getByText('Total empresas: 2')).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar carregamento', async () => {
        listarUsuarios.mockRejectedValue(new Error('Falha usuários'));

        render(<PainelListagemUsuarios />);

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha usuários');
    });

    it('deve exibir erro generico e ignorar falha de empresas', async () => {
        listarUsuarios.mockRejectedValue(new Error());
        listarEmpresas.mockRejectedValue(new Error('Falha empresas'));

        render(<PainelListagemUsuarios />);

        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os usuários.');
    });

    it('deve limpar mensagem de erro', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        listarUsuarios.mockRejectedValue(new Error('Falha usuários'));

        render(<PainelListagemUsuarios />);

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha usuários');

        await act(async () => {
            await vi.advanceTimersByTimeAsync(5000);
        });

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        vi.useRealTimers();
    });

    it('deve recarregar lista após remoção de usuário', async () => {
        const usuario = userEvent.setup();

        render(<PainelListagemUsuarios />);

        await waitFor(() => {
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: 'Recarregar usuários' }));

        expect(listarUsuarios).toHaveBeenCalledTimes(2);
    });

    it('deve usar plural no cabeçalho com múltiplos usuários', async () => {
        listarUsuarios.mockResolvedValue([
            { id: '2', name: 'Maria' },
            { id: '3', name: 'João' }
        ]);

        render(<PainelListagemUsuarios />);

        await waitFor(() => {
            expect(screen.getByText('2 usuários com acesso ao portal.')).toBeInTheDocument();
        });
    });
});
