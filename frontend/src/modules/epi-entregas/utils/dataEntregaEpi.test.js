import { describe, expect, it } from 'vitest';

import { obterDataIsoHoje } from './dataEntregaEpi.js';

describe('dataEntregaEpi', () => {
    it('deve retornar data de hoje no formato ISO', () => {
        const hoje = new Date();
        const esperado = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

        expect(obterDataIsoHoje()).toBe(esperado);
    });
});
