import { describe, expect, it } from 'vitest';

import { SECOES_RELATORIOS_EPI } from './secoesRelatoriosEpi.js';

describe('secoesRelatoriosEpi', () => {
    it('deve definir tres secoes com rotas', () => {
        expect(SECOES_RELATORIOS_EPI).toHaveLength(3);
        expect(SECOES_RELATORIOS_EPI.map((secao) => secao.id)).toEqual([
            'emitir',
            'ultimas',
            'historico'
        ]);
        expect(SECOES_RELATORIOS_EPI[0].rota).toBe('/admin/epis/relatorios/emitir');
    });
});
