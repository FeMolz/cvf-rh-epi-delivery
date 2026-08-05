import { describe, expect, it } from '@jest/globals';

import { formatarNomeCargo } from './formatarNomeCargo.js';

describe('formatarNomeCargo', () => {
    it('deve remover espacos extras nas extremidades e entre palavras', () => {
        expect(formatarNomeCargo('  Eng   de   Minas  ')).toBe('ENG DE MINAS');
    });

    it('deve retornar string vazia para valores vazios', () => {
        expect(formatarNomeCargo('   ')).toBe('');
        expect(formatarNomeCargo(null)).toBe('');
    });
});
