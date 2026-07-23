import { jest } from '@jest/globals';
import {
    afastamentoTemporarioExpirado,
    inicioDoDia,
    statusFuncionarioExigeDataRetornoAfastamento
} from './afastamentoTemporarioFuncionario.js';
import {
    obterStatusAposExpiracaoAfastamento,
    resolverDataRetornoAfastamento
} from './resolverDataRetornoAfastamento.js';

describe('afastamentoTemporarioFuncionario', () => {
    it('deve identificar status com data de retorno obrigatória', () => {
        expect(statusFuncionarioExigeDataRetornoAfastamento('FERIAS')).toBe(true);
        expect(statusFuncionarioExigeDataRetornoAfastamento('ATIVO')).toBe(false);
        expect(statusFuncionarioExigeDataRetornoAfastamento(null)).toBe(false);
        expect(statusFuncionarioExigeDataRetornoAfastamento(undefined)).toBe(false);
    });

    it('deve normalizar inicio do dia para valores válidos e inválidos', () => {
        expect(inicioDoDia(null)).toBeNull();
        expect(inicioDoDia(undefined)).toBeNull();
        expect(inicioDoDia('')).toBeNull();
        expect(inicioDoDia('data-invalida')).toBeNull();

        const dataString = inicioDoDia('2026-06-20');
        expect(dataString).toBeInstanceOf(Date);
        expect(dataString?.getHours()).toBe(0);

        const dataObjeto = inicioDoDia(new Date('2026-06-20T15:30:00Z'));
        expect(dataObjeto).toBeInstanceOf(Date);
        expect(dataObjeto?.getHours()).toBe(0);
    });

    it('deve interpretar data ISO somente dia no fuso local', () => {
        const data = inicioDoDia('2026-07-24');

        expect(data).toBeInstanceOf(Date);
        expect(data?.getFullYear()).toBe(2026);
        expect(data?.getMonth()).toBe(6);
        expect(data?.getDate()).toBe(24);
    });

    it('deve considerar afastamento expirado na data de retorno', () => {
        expect(afastamentoTemporarioExpirado(new Date('2026-06-20'), new Date('2026-06-22'))).toBe(
            true
        );
        expect(afastamentoTemporarioExpirado(new Date('2026-06-25'), new Date('2026-06-22'))).toBe(
            false
        );
        expect(afastamentoTemporarioExpirado(null, new Date('2026-06-22'))).toBe(false);
        expect(afastamentoTemporarioExpirado(new Date('2026-06-20'), 'invalido')).toBe(false);
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

    it('deve aceitar data de retorno no dia seguinte', () => {
        const hoje = new Date();
        const amanha = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
        const dataIso = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(amanha.getDate()).padStart(2, '0')}`;

        const resultado = resolverDataRetornoAfastamento({
            statusAnterior: 'ATIVO',
            statusNovo: 'FERIAS',
            leaveReturnDate: dataIso
        });

        expect(afastamentoTemporarioExpirado(resultado.leaveReturnDate, hoje)).toBe(false);
        expect(resultado.leaveReturnDate?.getDate()).toBe(amanha.getDate());
    });

    it('deve limpar data ao voltar para ativo', () => {
        const resultado = resolverDataRetornoAfastamento({
            statusAnterior: 'FERIAS',
            statusNovo: 'ATIVO',
            leaveReturnDateAnterior: new Date('2099-12-31')
        });

        expect(resultado.leaveReturnDate).toBeNull();
    });

    it('deve limpar data ao sair de afastamento mesmo informando leaveReturnDate', () => {
        const resultado = resolverDataRetornoAfastamento({
            statusAnterior: 'FERIAS',
            statusNovo: 'ATIVO',
            leaveReturnDate: '2099-12-31'
        });

        expect(resultado.leaveReturnDate).toBeNull();
    });

    it('deve rejeitar data de retorno inválida', () => {
        expect(() =>
            resolverDataRetornoAfastamento({
                statusAnterior: 'ATIVO',
                statusNovo: 'FERIAS',
                leaveReturnDate: 'data-invalida'
            })
        ).toThrow(/data prevista de retorno/i);

        expect(() =>
            resolverDataRetornoAfastamento({
                statusAnterior: 'FERIAS',
                statusNovo: 'FERIAS',
                leaveReturnDateAnterior: new Date('data-invalida')
            })
        ).toThrow(/data prevista de retorno inválida/i);
    });

    it('deve rejeitar data de retorno passada ao entrar em afastamento', () => {
        expect(() =>
            resolverDataRetornoAfastamento({
                statusAnterior: 'ATIVO',
                statusNovo: 'FERIAS',
                leaveReturnDate: '2020-01-01'
            })
        ).toThrow(/data prevista de retorno deve ser hoje ou uma data futura/i);
    });

    it('deve rejeitar alteração para data passada em afastamento existente', () => {
        expect(() =>
            resolverDataRetornoAfastamento({
                statusAnterior: 'FERIAS',
                statusNovo: 'FERIAS',
                leaveReturnDate: '2020-01-01',
                leaveReturnDateAnterior: new Date('2099-12-31')
            })
        ).toThrow(/data prevista de retorno deve ser hoje ou uma data futura/i);
    });

    it('deve manter data anterior quando afastamento continua sem nova data', () => {
        const dataAnterior = new Date('2099-12-31');
        const resultado = resolverDataRetornoAfastamento({
            statusAnterior: 'FERIAS',
            statusNovo: 'FERIAS',
            leaveReturnDateAnterior: dataAnterior
        });

        expect(resultado.leaveReturnDate).toEqual(inicioDoDia(dataAnterior));
    });

    it('deve retornar status ATIVO após expiração de afastamento', () => {
        expect(obterStatusAposExpiracaoAfastamento('FERIAS')).toBe('ATIVO');
    });
});
