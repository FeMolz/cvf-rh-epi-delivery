import { describe, expect, it, vi } from 'vitest';

import { listarEmpresas } from './empresasApi.js';

vi.mock('../../../shared/api/clienteHttp.js', () => ({
    requisicaoApi: vi.fn()
}));

const { requisicaoApi } = await import('../../../shared/api/clienteHttp.js');

describe('funcionarios/empresasApi', () => {
    it('deve reexportar listarEmpresas do modulo empresas', async () => {
        requisicaoApi.mockResolvedValue([{ id: '1', name: 'Empresa A' }]);

        const resultado = await listarEmpresas('jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/companies', { token: 'jwt' });
        expect(resultado).toEqual([{ id: '1', name: 'Empresa A' }]);
    });
});
