import { jest } from '@jest/globals';
import {
    afastamentoTemporarioExpirado,
    statusFuncionarioExigeDataRetornoAfastamento
} from './afastamentoTemporarioFuncionario.js';
import { resolverDataRetornoAfastamento } from './resolverDataRetornoAfastamento.js';

describe('afastamentoTemporarioFuncionario', () => {
    it('deve identificar status com data de retorno obrigatória', () => {
        expect(statusFuncionarioExigeDataRetornoAfastamento('FERIAS')).toBe(true);
        expect(statusFuncionarioExigeDataRetornoAfastamento('ATIVO')).toBe(false);
    });

    it('deve considerar afastamento expirado na data de retorno', () => {
        expect(afastamentoTemporarioExpirado(new Date('2026-06-20'), new Date('2026-06-22'))).toBe(
            true
        );
        expect(afastamentoTemporarioExpirado(new Date('2026-06-25'), new Date('2026-06-22'))).toBe(
            false
        );
    });
});

describe('resolverDataRetornoAfastamento', () => {
    it('deve exigir data ao entrar em férias', () => {
        expect(() =>
            resolverDataRetornoAfastamento({
                statusAnterior: 'ATIVO',
                statusNovo: 'FERIAS'
            })
        ).toThrow(/data prevista de retorno/i);
    });

    it('deve aceitar data futura para afastamento temporário', () => {
        const resultado = resolverDataRetornoAfastamento({
            statusAnterior: 'ATIVO',
            statusNovo: 'FERIAS',
            leaveReturnDate: '2099-12-31'
        });

        expect(resultado.leaveReturnDate).toBeInstanceOf(Date);
    });

    it('deve limpar data ao voltar para ativo', () => {
        const resultado = resolverDataRetornoAfastamento({
            statusAnterior: 'FERIAS',
            statusNovo: 'ATIVO',
            leaveReturnDateAnterior: new Date('2099-12-31')
        });

        expect(resultado.leaveReturnDate).toBeNull();
    });
});
