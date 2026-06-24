import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requisicaoApi } from './clienteHttp.js';

const notificarSessaoExpiradaMock = vi.fn();

vi.mock('../auth/sessaoExpirada.js', () => ({
    deveEncerrarSessaoPorResposta: (status, token) => status === 401 && Boolean(token),
    notificarSessaoExpirada: (...argumentos) => notificarSessaoExpiradaMock(...argumentos)
}));

describe('requisicaoApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        notificarSessaoExpiradaMock.mockClear();
    });

    it('deve enviar Authorization quando token informado', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ok: true })
        });

        vi.stubGlobal('fetch', fetchMock);

        await requisicaoApi('/users', { token: 'jwt-teste' });

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/v1/users',
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer jwt-teste'
                })
            })
        );
    });

    it('deve lançar erro com mensagem da API', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                json: async () => ({ error: 'Credenciais inválidas.' })
            })
        );

        await expect(
            requisicaoApi('/users/login', { method: 'POST', body: { email: 'a', password: 'b' } })
        ).rejects.toThrow('Credenciais inválidas.');

        expect(notificarSessaoExpiradaMock).not.toHaveBeenCalled();
    });

    it('deve encerrar sessão quando API retornar 401 com token', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                json: async () => ({ message: 'Token de autenticação inválido ou expirado.' })
            })
        );

        await expect(requisicaoApi('/employees', { token: 'jwt-expirado' })).rejects.toThrow(
            'Token de autenticação inválido ou expirado.'
        );

        expect(notificarSessaoExpiradaMock).toHaveBeenCalledTimes(1);
    });
});
