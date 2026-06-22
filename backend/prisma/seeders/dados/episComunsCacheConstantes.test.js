import { EPIS_COMUNS_CACHE } from './episComunsCacheConstantes.js';

describe('episComunsCacheConstantes', () => {
    it('deve listar EPIs com CA, nome e validade', () => {
        expect(EPIS_COMUNS_CACHE.length).toBeGreaterThanOrEqual(10);

        for (const epi of EPIS_COMUNS_CACHE) {
            expect(epi.caNumber).toMatch(/^\d+$/);
            expect(epi.name.trim().length).toBeGreaterThan(2);
            expect(epi.caExpirationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(new Date(`${epi.caExpirationDate}T12:00:00Z`).getTime()).not.toBeNaN();
        }
    });

    it('deve ter CAs únicos', () => {
        const cas = EPIS_COMUNS_CACHE.map((epi) => epi.caNumber);
        expect(new Set(cas).size).toBe(cas.length);
    });
});
