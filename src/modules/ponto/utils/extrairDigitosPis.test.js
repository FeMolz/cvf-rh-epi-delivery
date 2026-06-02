import { extrairDigitosPis } from './extrairDigitosPis.js';

describe('extrairDigitosPis', () => {
    it('deve extrair apenas dígitos do PIS', () => {
        expect(extrairDigitosPis('123.45678.90-1')).toBe('12345678901');
    });

    it('deve retornar null quando PIS ausente', () => {
        expect(extrairDigitosPis(null)).toBeNull();
    });
});
