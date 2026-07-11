import { describe, expect, it, vi } from 'vitest';

import { desvincularEpiDoCargo, listarEpisPorCargo, vincularEpiAoCargo } from './rolesEpisApi.js';

vi.mock('../../../shared/api/clienteHttp.js', () => ({
    requisicaoApi: vi.fn()
}));

const { requisicaoApi } = await import('../../../shared/api/clienteHttp.js');

describe('rolesEpisApi', () => {
    it('deve listar epis por cargo', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarEpisPorCargo('cargo-1', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/roles-epis/cargo-1', { token: 'jwt' });
    });

    it('deve vincular epi ao cargo', async () => {
        requisicaoApi.mockResolvedValue({ id: 'vinculo-1' });

        await vincularEpiAoCargo(
            { roleId: 'cargo-1', caNumber: '11070', periodicityDays: 180 },
            'jwt'
        );

        expect(requisicaoApi).toHaveBeenCalledWith('/roles-epis', {
            method: 'POST',
            body: { roleId: 'cargo-1', caNumber: '11070', periodicityDays: 180 },
            token: 'jwt'
        });
    });

    it('deve desvincular epi do cargo', async () => {
        requisicaoApi.mockResolvedValue(undefined);

        await desvincularEpiDoCargo('cargo-1', 'epi-1', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/roles-epis/cargo-1/epi-1', {
            method: 'DELETE',
            token: 'jwt'
        });
    });
});
