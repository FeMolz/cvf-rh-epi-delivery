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

    it('deve rejeitar data de admissao vazia', () => {
        expect(() => validarDadosRhAprovacaoContratacao({ admissionDate: '   ' })).toThrow(
            MENSAGEM_DATA_ADMISSAO_OBRIGATORIA_RH
        );
    });

    it('deve aceitar admissionDate como instancia de Date', () => {
        const data = new Date('2026-06-01');
        const resultado = validarDadosRhAprovacaoContratacao({ admissionDate: data });

        expect(resultado.admissionDate).toBe(data);
    });

    it('deve usar false como padrão para benefícios ausentes', () => {
        const resultado = validarDadosRhAprovacaoContratacao({ admissionDate: '2026-06-01' });

        expect(resultado.valeTransporte).toBe(false);
        expect(resultado.valeAlimentacao).toBe(false);
        expect(resultado.planoSaude).toBe(false);
    });

    it('deve aceitar admissionDate numérica convertível', () => {
        const resultado = validarDadosRhAprovacaoContratacao({
            admissionDate: Date.parse('2026-06-01')
        });

        expect(resultado.admissionDate).toBeInstanceOf(Date);
    });
});
