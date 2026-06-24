import { describe, expect, it } from 'vitest';

import { obterExpiracaoJwtEmMs, tokenJwtExpirado } from './obterExpiracaoJwt.js';

function criarTokenComExp(segundosUnix) {
    const cabecalho = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ exp: segundosUnix }));
    return `${cabecalho}.${payload}.assinatura`;
}

describe('obterExpiracaoJwt', () => {
    it('deve extrair exp em milissegundos', () => {
        const token = criarTokenComExp(1_700_000_000);
        expect(obterExpiracaoJwtEmMs(token)).toBe(1_700_000_000_000);
    });

    it('deve retornar null para token inválido', () => {
        expect(obterExpiracaoJwtEmMs('token-invalido')).toBeNull();
        expect(obterExpiracaoJwtEmMs(null)).toBeNull();
    });

    it('tokenJwtExpirado deve considerar o horário atual', () => {
        const agora = 1_700_000_000_000;
        const tokenValido = criarTokenComExp(Math.floor(agora / 1000) + 60);
        const tokenExpirado = criarTokenComExp(Math.floor(agora / 1000) - 1);

        expect(tokenJwtExpirado(tokenValido, agora)).toBe(false);
        expect(tokenJwtExpirado(tokenExpirado, agora)).toBe(true);
    });
});
