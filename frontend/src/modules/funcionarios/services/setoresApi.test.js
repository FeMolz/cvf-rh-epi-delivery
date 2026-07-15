import { describe, expect, it, vi } from 'vitest';

import { listarSetores } from './setoresApi.js';

vi.mock('../../../shared/api/clienteHttp.js', () => ({
    requisicaoApi: vi.fn()
}));

const { requisicaoApi } = await import('../../../shared/api/clienteHttp.js');

describe('funcionarios/setoresApi', () => {
    it('deve reexportar listarSetores do modulo setores', async () => {
        requisicaoApi.mockResolvedValue([{ id: '1', nome: 'RH' }]);

        const resultado = await listarSetores('jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/setores', { token: 'jwt' });
        expect(resultado).toEqual([{ id: '1', nome: 'RH' }]);
    });
});
