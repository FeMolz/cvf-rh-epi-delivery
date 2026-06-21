import { describe, expect, it, vi } from 'vitest';

import { buscarEpiPorCa, buscarEpisPorNome, listarEpis } from './episApi.js';

vi.mock('../../../shared/api/clienteHttp.js', () => ({
    requisicaoApi: vi.fn()
}));

const { requisicaoApi } = await import('../../../shared/api/clienteHttp.js');

describe('episApi', () => {
    it('deve listar epis com token', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarEpis('jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/epis', { token: 'jwt' });
    });

    it('deve buscar epi por ca', async () => {
        requisicaoApi.mockResolvedValue({ id: '1', caNumber: '11070' });

        await buscarEpiPorCa('11070', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/epis/11070', { token: 'jwt' });
    });

    it('deve buscar epis por nome na base publica', async () => {
        requisicaoApi.mockResolvedValue([{ caNumber: '11070', name: 'Capacete' }]);

        await buscarEpisPorNome('capacete', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/epis/buscar-por-nome?nome=capacete', {
            token: 'jwt'
        });
    });
});
