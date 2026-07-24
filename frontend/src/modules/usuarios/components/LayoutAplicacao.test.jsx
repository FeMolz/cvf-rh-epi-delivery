import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LayoutAplicacao } from './LayoutAplicacao.jsx';
import { NOME_SISTEMA } from '../../../shared/components/LogoSistema.jsx';

const logoutMock = vi.fn().mockResolvedValue(undefined);
const navegarMock = vi.fn();

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('react-router-dom', async () => {
    const atual = await vi.importActual('react-router-dom');
    return {
        ...atual,
        useNavigate: () => navegarMock
    };
});

const { useAuth } = await import('../../../shared/auth/useAuth.js');

describe('LayoutAplicacao', () => {
    beforeEach(() => {
        logoutMock.mockClear();
        navegarMock.mockClear();
        document.title = '';
    });

    it('deve renderizar título, subtítulo e conteúdo sem usuário logado', () => {
        useAuth.mockReturnValue({
            user: null,
            logout: logoutMock,
            podeCadastrarUsuarios: false
        });

        render(
            <MemoryRouter>
                <LayoutAplicacao titulo="Título teste" subtitulo="Subtítulo teste">
                    <p>Conteúdo filho</p>
                </LayoutAplicacao>
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: 'Título teste' })).toBeInTheDocument();
        expect(screen.getByText('Subtítulo teste')).toBeInTheDocument();
        expect(screen.getByText('Conteúdo filho')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /sair/i })).not.toBeInTheDocument();
        expect(document.title).toBe(NOME_SISTEMA);
    });

    it('deve exibir dados do usuário e link de gerenciamento quando permitido', () => {
        useAuth.mockReturnValue({
            user: { name: 'Maria Silva', role: 'ADMIN' },
            logout: logoutMock,
            podeCadastrarUsuarios: true
        });

        render(
            <MemoryRouter>
                <LayoutAplicacao titulo="Painel">
                    <p>Área autenticada</p>
                </LayoutAplicacao>
            </MemoryRouter>
        );

        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
        expect(screen.getByText('Administrador')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /gerenciamento/i })).toHaveAttribute(
            'href',
            '/admin/gerenciamento'
        );
    });

    it('deve ocultar link de gerenciamento sem permissão de cadastro', () => {
        useAuth.mockReturnValue({
            user: { name: 'João', role: 'COLABORADOR' },
            logout: logoutMock,
            podeCadastrarUsuarios: false
        });

        render(
            <MemoryRouter>
                <LayoutAplicacao titulo="Painel" subtitulo={null}>
                    <p>Conteúdo</p>
                </LayoutAplicacao>
            </MemoryRouter>
        );

        expect(screen.queryByRole('link', { name: /gerenciamento/i })).not.toBeInTheDocument();
        expect(screen.queryByText('Subtítulo teste')).not.toBeInTheDocument();
    });

    it('deve encerrar sessão e navegar para login', async () => {
        const usuario = userEvent.setup();

        useAuth.mockReturnValue({
            user: { name: 'Maria', role: 'ADMIN' },
            logout: logoutMock,
            podeCadastrarUsuarios: false
        });

        render(
            <MemoryRouter>
                <LayoutAplicacao titulo="Painel">
                    <p>Conteúdo</p>
                </LayoutAplicacao>
            </MemoryRouter>
        );

        await usuario.click(screen.getByRole('button', { name: /sair/i }));

        expect(logoutMock).toHaveBeenCalledTimes(1);
        expect(navegarMock).toHaveBeenCalledWith('/login');
    });

    it('deve aplicar cartao amplo quando largura for ampla', () => {
        useAuth.mockReturnValue({
            user: null,
            logout: logoutMock,
            podeCadastrarUsuarios: false
        });

        const { container } = render(
            <MemoryRouter>
                <LayoutAplicacao titulo="Vagas" largura="ampla">
                    <p>Conteúdo</p>
                </LayoutAplicacao>
            </MemoryRouter>
        );

        expect(container.querySelector('.cartao--amplo')).toBeInTheDocument();
    });

    it('deve aplicar variante aberta sem container visivel', () => {
        useAuth.mockReturnValue({
            user: null,
            logout: logoutMock,
            podeCadastrarUsuarios: false
        });

        const { container } = render(
            <MemoryRouter>
                <LayoutAplicacao titulo="Vagas" largura="ampla" variante="aberta">
                    <p>Conteúdo</p>
                </LayoutAplicacao>
            </MemoryRouter>
        );

        expect(container.querySelector('.cartao--aberto')).toBeInTheDocument();
        expect(container.querySelector('.layout__conteudo--aberto')).toBeInTheDocument();
    });

    it('deve exibir papel desconhecido quando rotulo nao estiver mapeado', () => {
        useAuth.mockReturnValue({
            user: { name: 'João', role: 'PAPEL_CUSTOM' },
            logout: logoutMock,
            podeCadastrarUsuarios: false
        });

        render(
            <MemoryRouter>
                <LayoutAplicacao titulo="Painel">
                    <p>Conteúdo</p>
                </LayoutAplicacao>
            </MemoryRouter>
        );

        expect(screen.getByText('PAPEL_CUSTOM')).toBeInTheDocument();
    });
});
