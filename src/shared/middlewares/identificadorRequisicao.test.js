import { jest } from '@jest/globals';

jest.unstable_mockModule('node:crypto', () => ({
    randomUUID: jest.fn(() => 'uuid-gerado-teste')
}));

const { identificadorRequisicao } = await import('./identificadorRequisicao.js');

describe('identificadorRequisicao', () => {
    it('deve usar o header x-request-id quando informado', () => {
        const middleware = identificadorRequisicao();
        const requisicao = { headers: { 'x-request-id': 'id-cliente' } };
        const resposta = { setHeader: jest.fn() };
        const proximo = jest.fn();

        middleware(requisicao, resposta, proximo);

        expect(requisicao.idRequisicao).toBe('id-cliente');
        expect(resposta.setHeader).toHaveBeenCalledWith('X-Request-Id', 'id-cliente');
        expect(proximo).toHaveBeenCalled();
    });

    it('deve gerar UUID quando o header não existir', () => {
        const middleware = identificadorRequisicao();
        const requisicao = { headers: {} };
        const resposta = { setHeader: jest.fn() };
        const proximo = jest.fn();

        middleware(requisicao, resposta, proximo);

        expect(requisicao.idRequisicao).toBe('uuid-gerado-teste');
        expect(resposta.setHeader).toHaveBeenCalledWith('X-Request-Id', 'uuid-gerado-teste');
    });
});
