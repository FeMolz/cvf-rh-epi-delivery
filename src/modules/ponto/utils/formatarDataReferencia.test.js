import { formatarDataReferencia } from './formatarDataReferencia.js';

describe('formatarDataReferencia', () => {
    it('deve aceitar data no formato yyyy-MM-dd', () => {
        expect(formatarDataReferencia('2026-05-22')).toBe('2026-05-22');
    });

    it('deve retornar string vazia para formato inválido', () => {
        expect(formatarDataReferencia('22/05/2026')).toBe('');
    });

    it('deve usar data atual quando parâmetro ausente', () => {
        const resultado = formatarDataReferencia();
        expect(resultado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});
