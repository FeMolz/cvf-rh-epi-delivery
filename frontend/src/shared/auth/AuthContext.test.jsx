import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthProvider } from './AuthContext.jsx';
import { useAuth } from './useAuth.js';

vi.mock('../../modules/usuarios/services/usuariosApi.js', () => ({
    autenticarUsuario: vi.fn(),
    encerrarSessao: vi.fn()
}));

vi.mock('./sessaoExpirada.js', () => ({
    reiniciarNotificacaoSessaoExpirada: vi.fn()
}));

const { autenticarUsuario, encerrarSessao } = await import(
    '../../modules/usuarios/services/usuariosApi.js'
);

function criarTokenJwtComExpiracao(segundosRelativos) {
    const cabecalho = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
        JSON.stringify({
            id: 'usuario-1',
            exp: Math.floor(Date.now() / 1000) + segundosRelativos
        })
    );

    return `${cabecalho}.${payload}.assinatura-fake`;
}

function PainelAuth() {
    const auth = useAuth();

    return (
        <div>
            <span data-testid="autenticado">{String(auth.autenticado)}</span>
            <span data-testid="nome">{auth.user?.name || '—'}</span>
            <span data-testid="pode-cadastrar">{String(auth.podeCadastrarUsuarios)}</span>
            <button type="button" onClick={() => auth.login('a@b.com', '123')}>
                Entrar
            </button>
            <button type="button" onClick={() => auth.logout()}>
                Sair
            </button>
            <button type="button" onClick={() => auth.encerrarSessaoLocal()}>
                Limpar local
            </button>
        </div>
    );
}

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('deve restaurar sessao valida do localStorage', () => {
        const usuario = { id: '1', name: 'Admin', email: 'a@b.com', role: 'ADMIN' };
        const token = criarTokenJwtComExpiracao(3600);
        localStorage.setItem('rh_system_token', token);
        localStorage.setItem('rh_system_user', JSON.stringify(usuario));

        render(
            <AuthProvider>
                <PainelAuth />
            </AuthProvider>
        );

        expect(screen.getByTestId('autenticado')).toHaveTextContent('true');
        expect(screen.getByTestId('nome')).toHaveTextContent('Admin');
        expect(screen.getByTestId('pode-cadastrar')).toHaveTextContent('true');
    });

    it('deve descartar sessao incompleta no storage', () => {
        localStorage.setItem('rh_system_token', criarTokenJwtComExpiracao(3600));

        render(
            <AuthProvider>
                <PainelAuth />
            </AuthProvider>
        );

        expect(screen.getByTestId('autenticado')).toHaveTextContent('false');
    });

    it('deve descartar sessao expirada', () => {
        const usuario = { id: '1', name: 'Admin', email: 'a@b.com', role: 'ADMIN' };
        const token = criarTokenJwtComExpiracao(-30);
        localStorage.setItem('rh_system_token', token);
        localStorage.setItem('rh_system_user', JSON.stringify(usuario));

        render(
            <AuthProvider>
                <PainelAuth />
            </AuthProvider>
        );

        expect(screen.getByTestId('autenticado')).toHaveTextContent('false');
        expect(localStorage.getItem('rh_system_token')).toBeNull();
    });

    it('deve descartar sessao com usuario invalido no storage', () => {
        const token = criarTokenJwtComExpiracao(3600);
        localStorage.setItem('rh_system_token', token);
        localStorage.setItem('rh_system_user', '{json-invalido');

        render(
            <AuthProvider>
                <PainelAuth />
            </AuthProvider>
        );

        expect(screen.getByTestId('autenticado')).toHaveTextContent('false');
    });

    it('deve autenticar e encerrar sessao', async () => {
        const usuario = userEvent.setup();
        const usuarioLogado = { id: '1', name: 'Admin', email: 'a@b.com', role: 'ADMIN' };
        const token = criarTokenJwtComExpiracao(3600);

        autenticarUsuario.mockResolvedValue({ token, user: usuarioLogado });
        encerrarSessao.mockResolvedValue(undefined);

        render(
            <AuthProvider>
                <PainelAuth />
            </AuthProvider>
        );

        await usuario.click(screen.getByRole('button', { name: /entrar/i }));

        await waitFor(() => {
            expect(screen.getByTestId('autenticado')).toHaveTextContent('true');
            expect(screen.getByTestId('nome')).toHaveTextContent('Admin');
        });

        await usuario.click(screen.getByRole('button', { name: /sair/i }));

        await waitFor(() => {
            expect(encerrarSessao).toHaveBeenCalledWith(token);
            expect(screen.getByTestId('autenticado')).toHaveTextContent('false');
        });
    });

    it('deve encerrar sessao local mesmo com falha no logout remoto', async () => {
        const usuario = userEvent.setup();
        const usuarioLogado = { id: '1', name: 'Admin', email: 'a@b.com', role: 'ADMIN' };
        const token = criarTokenJwtComExpiracao(3600);

        autenticarUsuario.mockResolvedValue({ token, user: usuarioLogado });
        encerrarSessao.mockRejectedValue(new Error('rede'));

        render(
            <AuthProvider>
                <PainelAuth />
            </AuthProvider>
        );

        await usuario.click(screen.getByRole('button', { name: /entrar/i }));
        await waitFor(() => {
            expect(screen.getByTestId('autenticado')).toHaveTextContent('true');
        });

        await usuario.click(screen.getByRole('button', { name: /sair/i }));

        await waitFor(() => {
            expect(screen.getByTestId('autenticado')).toHaveTextContent('false');
        });
    });

    it('deve limpar sessao local sem chamar logout remoto', async () => {
        const usuario = userEvent.setup();

        render(
            <AuthProvider>
                <PainelAuth />
            </AuthProvider>
        );

        await usuario.click(screen.getByRole('button', { name: /limpar local/i }));

        expect(screen.getByTestId('autenticado')).toHaveTextContent('false');
        expect(encerrarSessao).not.toHaveBeenCalled();
    });
});

describe('useAuth', () => {
    it('deve lançar erro fora do AuthProvider', () => {
        expect(() => render(<PainelAuth />)).toThrow(/useAuth deve ser usado dentro de AuthProvider/i);
    });
});
