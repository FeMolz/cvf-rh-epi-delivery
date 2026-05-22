import {
    MENSAGEM_DATA_FIM_INVALIDA,
    MENSAGEM_DATA_INICIO_INVALIDA,
    MENSAGEM_PERIODO_FILTRO_INVALIDO
} from '../constants/recrutamentoConstantes.js';
import { validarPeriodoFiltroCandidaturas } from './validarPeriodoFiltroCandidaturas.js';

describe('validarPeriodoFiltroCandidaturas', () => {
    it('deve retornar periodo valido', () => {
        const resultado = validarPeriodoFiltroCandidaturas({
            dataInicio: '2026-01-01',
            dataFim: '2026-12-31'
        });

        expect(resultado.dataInicio).toBeInstanceOf(Date);
        expect(resultado.dataFim).toBeInstanceOf(Date);
    });

    it('deve retornar objeto vazio sem filtros', () => {
        const resultado = validarPeriodoFiltroCandidaturas({});
        expect(resultado).toEqual({});
    });

    it('deve rejeitar data inicio invalida', () => {
        expect(() =>
            validarPeriodoFiltroCandidaturas({ dataInicio: 'data-invalida' })
        ).toThrow(MENSAGEM_DATA_INICIO_INVALIDA);
    });

    it('deve rejeitar data fim invalida', () => {
        expect(() =>
            validarPeriodoFiltroCandidaturas({ dataFim: 'xx' })
        ).toThrow(MENSAGEM_DATA_FIM_INVALIDA);
    });

    it('deve rejeitar periodo invertido', () => {
        expect(() =>
            validarPeriodoFiltroCandidaturas({
                dataInicio: '2026-12-31',
                dataFim: '2026-01-01'
            })
        ).toThrow(MENSAGEM_PERIODO_FILTRO_INVALIDO);
    });
});
