import { describe, expect, it } from 'vitest';

import {
    SITUACAO_EPI_ENTREGA,
    formatarDataEntregaEpi,
    obterClasseSituacaoEpi,
    obterRotuloSituacaoEpi
} from './situacaoEntregaEpi.js';

describe('situacaoEntregaEpi', () => {
    it('deve retornar rotulo da situacao', () => {
        expect(obterRotuloSituacaoEpi(SITUACAO_EPI_ENTREGA.VENCIDO)).toBe('Vencido');
        expect(obterRotuloSituacaoEpi(SITUACAO_EPI_ENTREGA.PENDENTE)).toBe('Pendente');
        expect(obterRotuloSituacaoEpi('DESCONHECIDO')).toBe('DESCONHECIDO');
    });

    it('deve retornar classe css da situacao', () => {
        expect(obterClasseSituacaoEpi(SITUACAO_EPI_ENTREGA.EM_DIA)).toContain('ativo');
        expect(obterClasseSituacaoEpi(SITUACAO_EPI_ENTREGA.VENCIDO)).toContain('encerrado');
        expect(obterClasseSituacaoEpi(SITUACAO_EPI_ENTREGA.PENDENTE)).toContain('afastado');
        expect(obterClasseSituacaoEpi(SITUACAO_EPI_ENTREGA.SEM_PERIODICIDADE)).toBe('status-badge');
    });

    it('deve formatar data de entrega ou retornar traco', () => {
        expect(formatarDataEntregaEpi('')).toBe('—');
        expect(formatarDataEntregaEpi('invalido')).toBe('—');
        expect(formatarDataEntregaEpi(new Date('2024-06-15T12:00:00.000Z'))).toMatch(
            /\d{2}\/\d{2}\/\d{4}/
        );
    });
});
