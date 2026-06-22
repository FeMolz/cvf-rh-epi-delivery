import { describe, expect, it } from 'vitest';

import {
    SITUACAO_EPI_ENTREGA,
    obterClasseSituacaoEpi,
    obterRotuloSituacaoEpi
} from './situacaoEntregaEpi.js';

describe('situacaoEntregaEpi', () => {
    it('deve retornar rotulo da situacao', () => {
        expect(obterRotuloSituacaoEpi(SITUACAO_EPI_ENTREGA.VENCIDO)).toBe('Vencido');
    });

    it('deve retornar classe css da situacao', () => {
        expect(obterClasseSituacaoEpi(SITUACAO_EPI_ENTREGA.EM_DIA)).toContain('ativo');
        expect(obterClasseSituacaoEpi(SITUACAO_EPI_ENTREGA.VENCIDO)).toContain('afastado');
    });
});
