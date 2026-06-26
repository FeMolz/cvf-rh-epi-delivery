import { describe, expect, it } from 'vitest';

import {
    obterExpiracaoJwt,
    obterTempoRestanteJwt,
    tokenJwtExpirado
} from './jwtUtils.js';

function criarTokenJwtComExpiracao(segundosRelativos) {
    const cabecalho = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
        JSON.stringify({
            id: 'usuario-1',
            exp: Math.floor(Date.now() / 1000) + segundosRelativos
        })
    );

    return `${cabecalho}.${payload}.assinatura-fake`;
}

describe('jwtUtils', () => {
    it('deve identificar token expirado', () => {
        const token = criarTokenJwtComExpiracao(-30);

        expect(tokenJwtExpirado(token)).toBe(true);
        expect(obterTempoRestanteJwt(token)).toBe(0);
    });

    it('deve identificar token ainda válido', () => {
        const token = criarTokenJwtComExpiracao(120);

        expect(tokenJwtExpirado(token)).toBe(false);
        expect(obterTempoRestanteJwt(token)).toBeGreaterThan(0);
        expect(obterExpiracaoJwt(token)).toBeGreaterThan(Date.now());
    });

    it('deve ignorar token sem exp válido', () => {
        expect(tokenJwtExpirado('token-invalido')).toBe(false);
        expect(obterExpiracaoJwt('token-invalido')).toBeNull();
        expect(obterTempoRestanteJwt('token-invalido')).toBeNull();
    });
});
