import { describe, expect, it, vi } from 'vitest';

import {
    autenticarUsuario,
    atualizarUsuario,
    buscarUsuarioPorId,
    cadastrarUsuario,
    encerrarSessao,
    excluirUsuario,
    listarUsuarios
} from './usuariosApi.js';

vi.mock('../../../shared/api/clienteHttp.js', () => ({
    requisicaoApi: vi.fn()
}));

const { requisicaoApi } = await import('../../../shared/api/clienteHttp.js');

describe('usuariosApi', () => {
    it('deve chamar login com POST', async () => {
        requisicaoApi.mockResolvedValue({ token: 'jwt' });

        await autenticarUsuario({ email: 'a@b.com', password: 'senha123' });

        expect(requisicaoApi).toHaveBeenCalledWith('/users/login', {
            method: 'POST',
            body: { email: 'a@b.com', password: 'senha123' }
        });
    });

    it('deve encerrar sessao com token', async () => {
        requisicaoApi.mockResolvedValue(undefined);

        await encerrarSessao('jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/users/logout', {
            method: 'POST',
            token: 'jwt'
        });
    });

    it('deve listar usuários com token', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarUsuarios('jwt-admin');

        expect(requisicaoApi).toHaveBeenCalledWith('/users', { token: 'jwt-admin' });
    });

    it('deve buscar usuário por id', async () => {
        requisicaoApi.mockResolvedValue({ id: '1' });

        await buscarUsuarioPorId('1', 'jwt-admin');

        expect(requisicaoApi).toHaveBeenCalledWith('/users/1', { token: 'jwt-admin' });
    });

    it('deve atualizar usuário', async () => {
        requisicaoApi.mockResolvedValue({ id: '1' });

        await atualizarUsuario('1', { name: 'Novo' }, 'jwt-admin');

        expect(requisicaoApi).toHaveBeenCalledWith('/users/1', {
            method: 'PUT',
            body: { name: 'Novo' },
            token: 'jwt-admin'
        });
    });

    it('deve excluir usuário', async () => {
        requisicaoApi.mockResolvedValue({ id: '1' });

        await excluirUsuario('1', 'jwt-admin');

        expect(requisicaoApi).toHaveBeenCalledWith('/users/1', {
            method: 'DELETE',
            token: 'jwt-admin'
        });
    });

    it('deve chamar cadastro com token', async () => {
        requisicaoApi.mockResolvedValue({ id: '1' });

        await cadastrarUsuario(
            {
                name: 'Maria',
                email: 'maria@b.com',
                password: 'senha123',
                role: 'COLABORADOR'
            },
            'jwt-admin'
        );

        expect(requisicaoApi).toHaveBeenCalledWith('/users', {
            method: 'POST',
            body: {
                name: 'Maria',
                email: 'maria@b.com',
                password: 'senha123',
                role: 'COLABORADOR'
            },
            token: 'jwt-admin'
        });
    });
});
