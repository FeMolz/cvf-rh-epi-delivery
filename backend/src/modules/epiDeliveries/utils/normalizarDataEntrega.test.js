import { describe, expect, it, jest } from '@jest/globals';

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

    it('deve aceitar instancia Date valida', () => {
        const data = resolverDataEntrega(new Date('2025-06-10T12:00:00.000Z'));

        expect(data).toBeInstanceOf(Date);
        expect(data.getTime()).toBe(new Date('2025-06-10T12:00:00.000Z').getTime());
    });

    it('deve rejeitar data ISO quando Date.UTC retornar NaN', () => {
        const spyUtc = jest.spyOn(Date, 'UTC').mockReturnValue(Number.NaN);

        expect(() => resolverDataEntrega('2025-03-15')).toThrow('Data de entrega inválida.');

        spyUtc.mockRestore();
    });

    it('deve usar data atual para string vazia ou null', () => {
        expect(resolverDataEntrega('')).toBeInstanceOf(Date);
        expect(resolverDataEntrega(null)).toBeInstanceOf(Date);
    });

    it('deve rejeitar instancia Date invalida', () => {
        expect(() => resolverDataEntrega(new Date('invalido'))).toThrow('Data de entrega inválida.');
    });

    it('deve rejeitar string fora do padrao ISO', () => {
        expect(() => resolverDataEntrega('15/03/2025')).toThrow('Data de entrega inválida.');
    });

    it('deve converter string de data parseavel fora do padrao ISO', () => {
        const data = resolverDataEntrega('2025-03-15T00:00:00.000Z');

        expect(data.getUTCFullYear()).toBe(2025);
    });

    it('deve aceitar data de hoje sem erro', () => {
        const hoje = new Date();
        hoje.setHours(12, 0, 0, 0);

        expect(() => validarDataEntregaNaoFutura(hoje)).not.toThrow();
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
