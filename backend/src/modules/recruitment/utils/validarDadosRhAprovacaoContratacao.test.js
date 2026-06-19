import {
    MENSAGEM_DATA_ADMISSAO_INVALIDA,
    MENSAGEM_DATA_ADMISSAO_OBRIGATORIA_RH
} from '../constants/recrutamentoConstantes.js';
import { validarDadosRhAprovacaoContratacao } from './validarDadosRhAprovacaoContratacao.js';

describe('validarDadosRhAprovacaoContratacao', () => {
    it('deve validar data de admissao e beneficios do RH', () => {
        const resultado = validarDadosRhAprovacaoContratacao({
            admissionDate: '2026-06-01',
            valeTransporte: true,
            valeAlimentacao: false,
            planoSaude: true
        });

        expect(resultado.admissionDate).toBeInstanceOf(Date);
        expect(resultado.valeTransporte).toBe(true);
        expect(resultado.planoSaude).toBe(true);
    });

    it('deve rejeitar sem data de admissao', () => {
        expect(() => validarDadosRhAprovacaoContratacao({})).toThrow(
            MENSAGEM_DATA_ADMISSAO_OBRIGATORIA_RH
        );
    });

    it('deve rejeitar data de admissao invalida', () => {
        expect(() =>
            validarDadosRhAprovacaoContratacao({ admissionDate: 'data-invalida' })
        ).toThrow(MENSAGEM_DATA_ADMISSAO_INVALIDA);
    });
});
