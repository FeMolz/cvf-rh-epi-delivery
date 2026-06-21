import { describe, expect, it, vi } from 'vitest';

import {
    atualizarEmpresa,
    buscarEmpresaPorId,
    criarEmpresa,
    excluirEmpresa,
    listarEmpresas
} from './empresasApi.js';

vi.mock('../../../shared/api/clienteHttp.js', () => ({
    requisicaoApi: vi.fn()
}));

const { requisicaoApi } = await import('../../../shared/api/clienteHttp.js');

describe('empresasApi', () => {
    it('deve listar empresas com token', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarEmpresas('jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/companies', { token: 'jwt' });
    });

    it('deve buscar empresa por id', async () => {
        requisicaoApi.mockResolvedValue({ id: '1' });

        await buscarEmpresaPorId('1', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/companies/1', { token: 'jwt' });
    });

    it('deve criar empresa', async () => {
        requisicaoApi.mockResolvedValue({ id: '1' });

        await criarEmpresa({ name: 'Empresa A', cnpj: '11.111.111/0001-11' }, 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/companies', {
            method: 'POST',
            body: { name: 'Empresa A', cnpj: '11.111.111/0001-11' },
            token: 'jwt'
        });
    });

    it('deve atualizar empresa', async () => {
        requisicaoApi.mockResolvedValue({ id: '1' });

        await atualizarEmpresa('1', { name: 'Empresa B' }, 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/companies/1', {
            method: 'PUT',
            body: { name: 'Empresa B' },
            token: 'jwt'
        });
    });

    it('deve excluir empresa', async () => {
        requisicaoApi.mockResolvedValue(undefined);

        await excluirEmpresa('1', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/companies/1', {
            method: 'DELETE',
            token: 'jwt'
        });
    });
});
