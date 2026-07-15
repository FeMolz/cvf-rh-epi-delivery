import { describe, expect, it } from 'vitest';

import { ITENS_POR_PAGINA_EPI } from './paginacaoEntregasEpi.js';

describe('paginacaoEntregasEpi', () => {
    it('deve exportar itens por pagina', () => {
        expect(ITENS_POR_PAGINA_EPI).toBe(25);
    });
});
