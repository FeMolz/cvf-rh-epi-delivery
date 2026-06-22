import { CAS_REAIS_EPIS_SEED } from './casReaisEpiSeedConstantes.js';

const QUANTIDADE_EPIS_SEED = 50;

describe('casReaisEpiSeedConstantes', () => {
    it('deve listar apenas CAs numéricos, únicos e suficientes para o volume de seed', () => {
        expect(CAS_REAIS_EPIS_SEED.length).toBeGreaterThanOrEqual(QUANTIDADE_EPIS_SEED);

        const numerosUnicos = new Set(CAS_REAIS_EPIS_SEED);

        expect(numerosUnicos.size).toBe(CAS_REAIS_EPIS_SEED.length);
        expect(CAS_REAIS_EPIS_SEED.every((ca) => /^\d+$/.test(ca))).toBe(true);
        expect(CAS_REAIS_EPIS_SEED.some((ca) => ca.startsWith('SEED-'))).toBe(false);
    });
});
