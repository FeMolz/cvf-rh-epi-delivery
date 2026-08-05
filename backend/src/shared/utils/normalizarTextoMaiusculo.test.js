import { normalizarTextoMaiusculo } from './normalizarTextoMaiusculo.js';

describe('normalizarTextoMaiusculo', () => {
    it('deve retornar string vazia para undefined e null', () => {
        expect(normalizarTextoMaiusculo(undefined)).toBe('');
        expect(normalizarTextoMaiusculo(null)).toBe('');
    });

    it('deve converter para maiúsculas, trim e colapsar espaços', () => {
        expect(normalizarTextoMaiusculo('  ana   silva ')).toBe('ANA SILVA');
    });
});
