import { describe, expect, it } from '@jest/globals';

import {
    entregaCobertaPorRelatorio,
    possuiEntregaPendenteEmissao
} from './coberturaEntregaRelatorio.js';

describe('coberturaEntregaRelatorio', () => {
    it('deve retornar false quando nao houver entregas nem relatorios', () => {
        expect(possuiEntregaPendenteEmissao()).toBe(false);
        expect(possuiEntregaPendenteEmissao([], [])).toBe(false);
    });

    it('deve considerar entrega anterior ao inicio do periodo como pendente', () => {
        expect(
            entregaCobertaPorRelatorio(
                '2025-12-31T23:59:59.999Z',
                '2026-01-01T00:00:00.000Z',
                '2026-01-31T23:59:59.999Z'
            )
        ).toBe(false);
    });

    it('deve identificar entrega coberta pelo periodo do relatorio', () => {
        expect(
            entregaCobertaPorRelatorio(
                '2026-01-10T00:00:00.000Z',
                '2026-01-01T00:00:00.000Z',
                '2026-01-31T23:59:59.999Z'
            )
        ).toBe(true);

        expect(
            entregaCobertaPorRelatorio(
                '2026-01-01T00:00:00.000Z',
                '2026-01-01T00:00:00.000Z',
                '2026-01-31T23:59:59.999Z'
            )
        ).toBe(true);

        expect(
            entregaCobertaPorRelatorio(
                '2026-01-31T23:59:59.999Z',
                '2026-01-01T00:00:00.000Z',
                '2026-01-31T23:59:59.999Z'
            )
        ).toBe(true);

        expect(
            entregaCobertaPorRelatorio(
                '2026-02-01T00:00:00.000Z',
                '2026-01-01T00:00:00.000Z',
                '2026-01-31T23:59:59.999Z'
            )
        ).toBe(false);
    });

    it('deve indicar pendencia quando existir entrega fora dos relatorios', () => {
        const entregas = [{ deliveryDate: '2026-01-10T00:00:00.000Z' }];
        const relatorios = [
            {
                periodStartDate: '2026-01-01T00:00:00.000Z',
                periodEndDate: '2026-01-31T23:59:59.999Z'
            }
        ];

        expect(possuiEntregaPendenteEmissao(entregas, relatorios)).toBe(false);
        expect(
            possuiEntregaPendenteEmissao(
                [...entregas, { deliveryDate: '2026-02-05T00:00:00.000Z' }],
                relatorios
            )
        ).toBe(true);
        expect(possuiEntregaPendenteEmissao(entregas, [])).toBe(true);
        expect(possuiEntregaPendenteEmissao([], relatorios)).toBe(false);
    });
});
