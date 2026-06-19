import express from 'express';

/**
 * Monta app Express com handler global de erros HTTP (mesmo contrato de app.js).
 * @param {import('express').Router} router
 * @param {string} prefixoCaminho
 * @returns {import('express').Express}
 */
export function montarAplicacaoComTratadorErro(router, prefixoCaminho) {
    const aplicacao = express();
    aplicacao.use(express.json());
    aplicacao.use(prefixoCaminho, router);

    aplicacao.use((erro, _requisicao, resposta, _proximo) => {
        const codigoStatus = erro.statusCode || 500;
        resposta.status(codigoStatus).json({
            error: erro.message || 'Ocorreu um erro interno no servidor'
        });
    });

    return aplicacao;
}
