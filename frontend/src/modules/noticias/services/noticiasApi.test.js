import { describe, expect, it, vi } from 'vitest';

import { listarAfastamentosNoticias, listarAniversariantesNoticias } from './noticiasApi.js';

vi.mock('../../../shared/api/clienteHttp.js', () => ({
    requisicaoApi: vi.fn()
}));

const { requisicaoApi } = await import('../../../shared/api/clienteHttp.js');

describe('noticiasApi', () => {
    it('deve listar aniversariantes com token', async () => {
        requisicaoApi.mockResolvedValue({ mesReferencia: 'junho de 2025' });

        await listarAniversariantesNoticias('jwt-admin');

        expect(requisicaoApi).toHaveBeenCalledWith('/noticias/aniversariantes', {
            token: 'jwt-admin'
        });
    });

    it('deve listar afastamentos com token', async () => {
        requisicaoApi.mockResolvedValue({ mesReferencia: 'junho de 2025' });

        await listarAfastamentosNoticias('jwt-admin');

        expect(requisicaoApi).toHaveBeenCalledWith('/noticias/afastamentos', {
            token: 'jwt-admin'
        });
    });
});
