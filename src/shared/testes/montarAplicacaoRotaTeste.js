import express from 'express';

/**
 * Monta app Express mínimo para testes de rota com supertest.
 * @param {import('express').Router} router
 * @param {string} prefixoCaminho
 * @returns {import('express').Express}
 */
export function montarAplicacaoRotaTeste(router, prefixoCaminho) {
    const aplicacao = express();
    aplicacao.use(express.json());
    aplicacao.use(prefixoCaminho, router);
    return aplicacao;
}
