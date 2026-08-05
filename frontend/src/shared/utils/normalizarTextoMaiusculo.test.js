import { describe, expect, it } from 'vitest';

import { normalizarTextoMaiusculo } from './normalizarTextoMaiusculo.js';

describe('normalizarTextoMaiusculo', () => {
    it('deve converter texto para maiúsculas e colapsar espaços', () => {
        expect(normalizarTextoMaiusculo('  Maria   Silva  ')).toBe('MARIA SILVA');
    });

    it('deve retornar string vazia para valores nulos', () => {
        expect(normalizarTextoMaiusculo(null)).toBe('');
        expect(normalizarTextoMaiusculo(undefined)).toBe('');
        expect(normalizarTextoMaiusculo('   ')).toBe('');
    });
});
