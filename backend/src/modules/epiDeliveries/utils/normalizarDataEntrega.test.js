import { describe, expect, it } from '@jest/globals';

import {
    resolverDataEntrega,
    validarDataEntregaNaoFutura
} from './normalizarDataEntrega.js';

describe('normalizarDataEntrega', () => {
    it('deve usar data atual quando valor nao for informado', () => {
        const antes = Date.now();
        const data = resolverDataEntrega();
        const depois = Date.now();

        expect(data.getTime()).toBeGreaterThanOrEqual(antes);
        expect(data.getTime()).toBeLessThanOrEqual(depois);
    });

    it('deve converter string ISO yyyy-mm-dd', () => {
        const data = resolverDataEntrega('2025-03-15');

        expect(data.getUTCFullYear()).toBe(2025);
        expect(data.getUTCMonth()).toBe(2);
        expect(data.getUTCDate()).toBe(15);
    });

    it('deve rejeitar data invalida', () => {
        expect(() => resolverDataEntrega('data-invalida')).toThrow('Data de entrega inválida.');
    });

    it('deve rejeitar data futura', () => {
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 2);

        expect(() => validarDataEntregaNaoFutura(amanha)).toThrow(
            'A data de entrega não pode ser futura.'
        );
    });
});
