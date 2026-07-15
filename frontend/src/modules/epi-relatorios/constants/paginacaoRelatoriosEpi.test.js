import { describe, expect, it } from 'vitest';

import {
    DIAS_JANELA_ULTIMAS_EMISSOES_RELATORIO,
    ITENS_POR_PAGINA_RELATORIOS_EPI
} from './paginacaoRelatoriosEpi.js';

describe('paginacaoRelatoriosEpi', () => {
    it('deve exportar constantes de paginacao', () => {
        expect(ITENS_POR_PAGINA_RELATORIOS_EPI).toBe(25);
        expect(DIAS_JANELA_ULTIMAS_EMISSOES_RELATORIO).toBe(15);
    });
});
