import { describe, expect, it, vi } from 'vitest';

import {
    alterarPeriodicidadeEpi,
    buscarEpiPorCa,
    buscarEpisPorNome,
    listarEpis
} from './episApi.js';

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

    it('deve alterar periodicidade do epi vinculado ao cargo', async () => {
        requisicaoApi.mockResolvedValue({ id: 'vinculo-1' });

        await alterarPeriodicidadeEpi(
            { roleId: 'cargo-1', epiId: 'epi-1', newPeriodicityDays: 180 },
            'jwt'
        );

        expect(requisicaoApi).toHaveBeenCalledWith('/epis/periodicity', {
            method: 'PUT',
            body: { roleId: 'cargo-1', epiId: 'epi-1', newPeriodicityDays: 180 },
            token: 'jwt'
        });
    });

    it('deve buscar epis por nome com trim', async () => {
        requisicaoApi.mockResolvedValue([]);

        await buscarEpisPorNome('  capacete  ', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/epis/buscar-por-nome?nome=capacete', {
            token: 'jwt'
        });
    });

    it('deve codificar ca na url', async () => {
        requisicaoApi.mockResolvedValue({});

        await buscarEpiPorCa('11/070', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/epis/11%2F070', { token: 'jwt' });
    });
});
