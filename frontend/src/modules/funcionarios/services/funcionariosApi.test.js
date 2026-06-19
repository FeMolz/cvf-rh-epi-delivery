import { describe, expect, it, vi } from 'vitest';

import {
    atualizarFuncionario,
    baixarRelatorioFuncionarios,
    buscarFuncionarioPorId,
    criarFuncionario,
    listarFuncionarios
} from './funcionariosApi.js';

vi.mock('../../../shared/api/clienteHttp.js', () => ({
    requisicaoApi: vi.fn(),
    baixarArquivoApi: vi.fn()
}));

const { requisicaoApi, baixarArquivoApi } = await import('../../../shared/api/clienteHttp.js');

describe('funcionariosApi', () => {
    it('deve listar funcionarios com filtro', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarFuncionarios('jwt', { filtro: 'todos' });

        expect(requisicaoApi).toHaveBeenCalledWith('/employees?filtro=todos', { token: 'jwt' });
    });

    it('deve criar funcionario', async () => {
        requisicaoApi.mockResolvedValue({ id: '1' });

        await criarFuncionario({ name: 'Maria' }, 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/employees', {
            method: 'POST',
            body: { name: 'Maria' },
            token: 'jwt'
        });
    });

    it('deve buscar funcionario por id', async () => {
        requisicaoApi.mockResolvedValue({ id: '1', name: 'Maria' });

        await buscarFuncionarioPorId('1', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/employees/1', { token: 'jwt' });
    });

    it('deve atualizar funcionario', async () => {
        requisicaoApi.mockResolvedValue({ id: '1', name: 'Maria' });

        await atualizarFuncionario('1', { status: 'FERIAS' }, 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/employees/1', {
            method: 'PUT',
            body: { status: 'FERIAS' },
            token: 'jwt'
        });
    });

    it('deve baixar relatorio de funcionarios', async () => {
        baixarArquivoApi.mockResolvedValue(undefined);

        await baixarRelatorioFuncionarios('jwt', { filtro: 'todos' });

        expect(baixarArquivoApi).toHaveBeenCalledWith('/employees/export/lista?filtro=todos', {
            token: 'jwt',
            nomeArquivoPadrao: 'funcionarios.xlsx'
        });
    });

    it('deve baixar relatorio filtrado por empresa', async () => {
        baixarArquivoApi.mockResolvedValue(undefined);

        await baixarRelatorioFuncionarios('jwt', {
            filtro: 'todos',
            companyId: 'empresa-1'
        });

        expect(baixarArquivoApi).toHaveBeenCalledWith(
            '/employees/export/lista?filtro=todos&companyId=empresa-1',
            {
                token: 'jwt',
                nomeArquivoPadrao: 'funcionarios.xlsx'
            }
        );
    });

    it('deve baixar relatorio apenas dos funcionarios selecionados', async () => {
        baixarArquivoApi.mockResolvedValue(undefined);

        await baixarRelatorioFuncionarios('jwt', {
            filtro: 'todos',
            ids: ['func-1', 'func-2']
        });

        expect(baixarArquivoApi).toHaveBeenCalledWith(
            '/employees/export/lista?filtro=todos&ids=func-1%2Cfunc-2',
            {
                token: 'jwt',
                nomeArquivoPadrao: 'funcionarios.xlsx'
            }
        );
    });
});
