import { describe, expect, it } from 'vitest';

import { SECOES_ENTREGAS_EPI } from './secoesEntregasEpi.js';

describe('secoesEntregasEpi', () => {
    it('deve definir secoes de registro e imediata', () => {
        expect(SECOES_ENTREGAS_EPI).toHaveLength(2);
        expect(SECOES_ENTREGAS_EPI[0].id).toBe('registro');
        expect(SECOES_ENTREGAS_EPI[1].rota).toBe('/admin/epis/entregas/imediata');
    });
});
