import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../shared/api/clienteHttp.js', () => ({
    requisicaoApi: vi.fn()
}));

import { requisicaoApi } from '../../../shared/api/clienteHttp.js';
import {
    buscarPainelEntregasEpi,
    buscarSituacaoEpisFuncionario,
    registrarEntregaEpi
} from './epiEntregasApi.js';

describe('epiEntregasApi', () => {
    it('deve buscar painel de entregas', async () => {
        requisicaoApi.mockResolvedValue({ funcionariosElegiveis: [], episVencidos: [] });

        await buscarPainelEntregasEpi('token');

        expect(requisicaoApi).toHaveBeenCalledWith('/epi-deliveries/painel', { token: 'token' });
    });

    it('deve buscar situacao dos epis do funcionario', async () => {
        requisicaoApi.mockResolvedValue({ employee: {}, epis: [] });

        await buscarSituacaoEpisFuncionario('f1', 'token');

        expect(requisicaoApi).toHaveBeenCalledWith('/epi-deliveries/painel/funcionario/f1', {
            token: 'token'
        });
    });

    it('deve registrar entrega de epis com data informada', async () => {
        requisicaoApi.mockResolvedValue({ count: 1 });

        await registrarEntregaEpi(
            { employeeId: 'f1', caNumbers: ['11070'], deliveryDate: '2025-03-15' },
            'token'
        );

        expect(requisicaoApi).toHaveBeenCalledWith('/epi-deliveries', {
            method: 'POST',
            body: { employeeId: 'f1', caNumbers: ['11070'], deliveryDate: '2025-03-15' },
            token: 'token'
        });
    });

    it('deve registrar entrega sem data para usar o dia atual no backend', async () => {
        requisicaoApi.mockResolvedValue({ count: 1 });

        await registrarEntregaEpi({ employeeId: 'f1', caNumbers: ['11070'] }, 'token');

        expect(requisicaoApi).toHaveBeenCalledWith('/epi-deliveries', {
            method: 'POST',
            body: { employeeId: 'f1', caNumbers: ['11070'] },
            token: 'token'
        });
    });
});
