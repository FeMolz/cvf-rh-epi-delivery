import { describe, expect, it, vi } from 'vitest';

import {
    alterarSituacaoCargo,
    atualizarCargo,
    baixarRelatorioCargos,
    buscarCargoPorId,
    criarCargo,
    excluirCargo,
    listarCargos
} from './cargosApi.js';

vi.mock('../../../shared/api/clienteHttp.js', () => ({
    requisicaoApi: vi.fn(),
    baixarArquivoApi: vi.fn()
}));

const { requisicaoApi, baixarArquivoApi } = await import('../../../shared/api/clienteHttp.js');

describe('cargosApi', () => {
    it('deve listar cargos com token', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarCargos('jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/roles', { token: 'jwt' });
    });

    it('deve listar cargos incluindo inativos', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarCargos('jwt', { incluirInativos: true });

        expect(requisicaoApi).toHaveBeenCalledWith('/roles?incluirInativos=true', { token: 'jwt' });
    });

    it('deve listar apenas cargos inativos', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarCargos('jwt', { apenasInativos: true });

        expect(requisicaoApi).toHaveBeenCalledWith('/roles?apenasInativos=true', { token: 'jwt' });
    });

    it('deve buscar cargo por id', async () => {
        requisicaoApi.mockResolvedValue({ id: '1' });

        await buscarCargoPorId('1', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/roles/1', { token: 'jwt' });
    });

    it('deve criar cargo', async () => {
        requisicaoApi.mockResolvedValue({ id: '1' });

        await criarCargo({ name: 'Operador', description: 'Linha de produção' }, 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/roles', {
            method: 'POST',
            body: { name: 'Operador', description: 'Linha de produção' },
            token: 'jwt'
        });
    });

    it('deve atualizar cargo', async () => {
        requisicaoApi.mockResolvedValue({ id: '1' });

        await atualizarCargo('1', { name: 'Operador II' }, 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/roles/1', {
            method: 'PUT',
            body: { name: 'Operador II' },
            token: 'jwt'
        });
    });

    it('deve alterar situacao do cargo', async () => {
        requisicaoApi.mockResolvedValue({ id: '1', deletedAt: null });

        await alterarSituacaoCargo('1', true, 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/roles/1/situacao', {
            method: 'PATCH',
            body: { ativo: true },
            token: 'jwt'
        });
    });

    it('deve baixar relatorio de cargos ativos', async () => {
        baixarArquivoApi.mockResolvedValue(undefined);

        await baixarRelatorioCargos('jwt');

        expect(baixarArquivoApi).toHaveBeenCalledWith('/roles/export/lista', {
            token: 'jwt',
            nomeArquivoPadrao: 'cargos.xlsx'
        });
    });

    it('deve baixar relatorio de cargos inativos', async () => {
        baixarArquivoApi.mockResolvedValue(undefined);

        await baixarRelatorioCargos('jwt', { apenasInativos: true });

        expect(baixarArquivoApi).toHaveBeenCalledWith('/roles/export/lista?apenasInativos=true', {
            token: 'jwt',
            nomeArquivoPadrao: 'cargos.xlsx'
        });
    });

    it('deve excluir cargo', async () => {
        requisicaoApi.mockResolvedValue(undefined);

        await excluirCargo('1', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/roles/1', {
            method: 'DELETE',
            token: 'jwt'
        });
    });
});
