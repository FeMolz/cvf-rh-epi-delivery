import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requisicaoApi } from './clienteHttp.js';

describe('requisicaoApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
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
    });
});
