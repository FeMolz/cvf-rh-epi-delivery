import { describe, expect, it, vi } from 'vitest';

import {
    atualizarSetor,
    buscarSetorPorId,
    criarSetor,
    excluirSetor,
    listarSetores
} from './setoresApi.js';

vi.mock('../../../shared/api/clienteHttp.js', () => ({
    requisicaoApi: vi.fn()
}));

const { requisicaoApi } = await import('../../../shared/api/clienteHttp.js');

describe('setoresApi', () => {
    it('deve listar setores com token', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarSetores('jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/setores', { token: 'jwt' });
    });

    it('deve buscar setor por id', async () => {
        requisicaoApi.mockResolvedValue({ id: '1' });

        await buscarSetorPorId('1', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/setores/1', { token: 'jwt' });
    });

    it('deve criar setor', async () => {
        requisicaoApi.mockResolvedValue({ id: '1' });

        await criarSetor({ nome: 'TI' }, 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/setores', {
            method: 'POST',
            body: { nome: 'TI' },
            token: 'jwt'
        });
    });

    it('deve atualizar setor', async () => {
        requisicaoApi.mockResolvedValue({ id: '1' });

        await atualizarSetor('1', { nome: 'Tecnologia' }, 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/setores/1', {
            method: 'PUT',
            body: { nome: 'Tecnologia' },
            token: 'jwt'
        });
    });

    it('deve excluir setor', async () => {
        requisicaoApi.mockResolvedValue(undefined);

        await excluirSetor('1', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/setores/1', {
            method: 'DELETE',
            token: 'jwt'
        });
    });
});
