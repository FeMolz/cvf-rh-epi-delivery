import {
    MENSAGEM_ERRO_FORMATO_DATA,
    MENSAGEM_ERRO_PERIODO_INVALIDO
} from '../constants/relatorioEntregaEpiConstantes.js';
import { construirIntervaloEntregaUtc, formatarPeriodoParaPdf } from './periodoRelatorioEntregaEpi.js';

describe('periodoRelatorioEntregaEpi', () => {
    it('deve construir intervalo UTC inclusivo para o periodo informado', () => {
        const { limiteInicialEntrega, limiteFinalEntrega } = construirIntervaloEntregaUtc('2026-02-01', '2026-02-15');
        expect(limiteInicialEntrega.toISOString()).toBe('2026-02-01T00:00:00.000Z');
        expect(limiteFinalEntrega.toISOString()).toBe('2026-02-15T23:59:59.999Z');
    });

    it('deve rejeitar periodo com inicio posterior ao fim', () => {
        expect(() => construirIntervaloEntregaUtc('2026-03-01', '2026-02-01')).toThrow(MENSAGEM_ERRO_PERIODO_INVALIDO);
    });

    it('deve rejeitar formato de data fora do padrao AAAA-MM-DD', () => {
        expect(() => construirIntervaloEntregaUtc('01-02-2026', '2026-02-15')).toThrow(MENSAGEM_ERRO_FORMATO_DATA);
    });

    it('formatarPeriodoParaPdf deve produzir texto legivel', () => {
        const { limiteInicialEntrega, limiteFinalEntrega } = construirIntervaloEntregaUtc('2026-02-01', '2026-02-02');
        const texto = formatarPeriodoParaPdf(limiteInicialEntrega, limiteFinalEntrega);
        expect(texto).toContain('2026');
        expect(texto).toContain(' a ');
    });
});
