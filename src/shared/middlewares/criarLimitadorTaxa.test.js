import { jest } from '@jest/globals';
import { criarLimitadorTaxaMemoria } from './criarLimitadorTaxaMemoria.js';

const criarRespostaMock = () => {
    const resposta = {};
    resposta.status = jest.fn().mockReturnValue(resposta);
    resposta.json = jest.fn().mockReturnValue(resposta);
    return resposta;
};

describe('criarLimitadorTaxaMemoria', () => {
    it('deve permitir requisições dentro do limite', () => {
        const limitador = criarLimitadorTaxaMemoria({
            janelaMs: 60_000,
            limiteRequisicoes: 2
        });
        const requisicao = { ip: '10.0.0.1', path: '/rota-teste-a' };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        limitador(requisicao, resposta, proximo);
        limitador(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledTimes(2);
        expect(resposta.status).not.toHaveBeenCalled();
    });

    it('deve retornar 429 ao exceder o limite na janela', () => {
        const limitador = criarLimitadorTaxaMemoria({
            janelaMs: 60_000,
            limiteRequisicoes: 2,
            mensagem: 'Limite atingido'
        });
        const requisicao = { ip: '10.0.0.2', path: '/rota-teste-b' };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        limitador(requisicao, resposta, proximo);
        limitador(requisicao, resposta, proximo);
        limitador(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledTimes(2);
        expect(resposta.status).toHaveBeenCalledWith(429);
        expect(resposta.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Limite atingido'
        });
    });
});
