import { describe, expect, it } from 'vitest';

import {
    obterClasseResumoEpisFuncionario,
    obterMensagemResumoEpisFuncionario
} from './resumoEpisFuncionario.js';

describe('resumoEpisFuncionario', () => {
    it('deve indicar tudo em dia quando o cargo não tem EPIs', () => {
        expect(obterMensagemResumoEpisFuncionario({ totalEpis: 0 })).toBe('Tudo em dia');
    });

    it('deve indicar tudo em dia', () => {
        expect(obterMensagemResumoEpisFuncionario({ totalEpis: 2, emDia: 2 })).toBe('Tudo em dia');
    });

    it('deve indicar muitos vencidos', () => {
        expect(obterMensagemResumoEpisFuncionario({ totalEpis: 5, vencidos: 4 })).toBe(
            'Muitos vencidos (4)'
        );
    });

    it('deve aplicar classe de alerta para pendentes', () => {
        expect(obterClasseResumoEpisFuncionario({ pendentes: 1 })).toContain('afastado');
    });
});
