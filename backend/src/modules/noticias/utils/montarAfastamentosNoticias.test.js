import { jest } from '@jest/globals';
import {
    montarPainelAfastamentosNoticias,
    formatarDataBr,
    inicioDoDia,
    fimDoMes,
    rotuloStatusAfastamento,
    obterMesReferenciaAfastamentos
} from './montarAfastamentosNoticias.js';

describe('montarAfastamentosNoticias', () => {
    const referencia = new Date('2026-06-22');

    it('deve formatar data em pt-BR', () => {
        expect(formatarDataBr(new Date('2026-06-25'))).toBe('25/06/2026');
        expect(formatarDataBr(null)).toBe('—');
    });

    it('deve usar mes atual como referencia padrao', () => {
        expect(obterMesReferenciaAfastamentos()).toMatch(/\d{4}/);
    });

    it('deve manter em saindo retorno apos o ultimo dia do mes', () => {
        const resultado = montarPainelAfastamentosNoticias(
            [
                {
                    id: '8',
                    name: 'Helena',
                    status: 'FERIAS',
                    leaveReturnDate: '2026-07-05T00:00:00.000Z',
                    company: { name: '' }
                }
            ],
            referencia
        );

        expect(resultado.saindo).toHaveLength(1);
        expect(resultado.saindo[0].empresa).toBe('—');
    });

    it('deve manter em saindo retorno anterior ao dia de referencia', () => {
        const resultado = montarPainelAfastamentosNoticias(
            [
                {
                    id: '7',
                    name: 'Gustavo',
                    status: 'FERIAS',
                    leaveReturnDate: '2026-06-10T00:00:00.000Z',
                    company: { name: 'Empresa F' }
                }
            ],
            referencia
        );

        expect(resultado.saindo).toHaveLength(1);
        expect(resultado.voltando).toHaveLength(0);
    });

    it('deve ignorar funcionario sem status informado', () => {
        const resultado = montarPainelAfastamentosNoticias(
            [{ id: '13', name: 'Sem Status' }],
            referencia
        );

        expect(resultado).toEqual({ saindo: [], voltando: [] });
    });

    it('deve ordenar voltando por data de retorno', () => {
        const resultado = montarPainelAfastamentosNoticias(
            [
                {
                    id: '11',
                    name: 'Julia',
                    status: 'FERIAS',
                    leaveReturnDate: '2026-06-28T00:00:00.000Z',
                    company: { name: 'Empresa G' }
                },
                {
                    id: '12',
                    name: 'Kleber',
                    status: 'FERIAS',
                    leaveReturnDate: '2026-06-24T00:00:00.000Z',
                    company: { name: 'Empresa H' }
                }
            ],
            referencia
        );

        expect(resultado.voltando.map((item) => item.nome)).toEqual(['Kleber', 'Julia']);
    });

    it('deve classificar retorno no ultimo dia do mes como voltando', () => {
        const resultado = montarPainelAfastamentosNoticias(
            [
                {
                    id: '10',
                    name: 'Iara',
                    status: 'FERIAS',
                    leaveReturnDate: '2026-06-30T00:00:00.000Z',
                    company: {}
                }
            ],
            referencia
        );

        expect(resultado.voltando).toHaveLength(1);
        expect(resultado.voltando[0].empresa).toBe('—');
    });

    it('deve usar rotulo de ferias para status FERIAS', () => {
        expect(rotuloStatusAfastamento('FERIAS')).toBe('Férias');
    });

    it('deve tratar funcionario sem nome no painel', () => {
        const resultado = montarPainelAfastamentosNoticias(
            [
                {
                    id: '9',
                    status: 'FERIAS',
                    leaveReturnDate: '2026-08-01T00:00:00.000Z'
                }
            ],
            referencia
        );

        expect(resultado.saindo[0].nome).toBe('');
    });

    it('deve aceitar data de referencia como string em inicioDoDia', () => {
        expect(inicioDoDia('2026-06-22')?.toISOString()).toBe('2026-06-22T00:00:00.000Z');
    });

    it('deve montar painel com data de referencia padrao', () => {
        expect(montarPainelAfastamentosNoticias([])).toEqual({ saindo: [], voltando: [] });
    });

    it('deve usar data atual em fimDoMes quando referencia for invalida', () => {
        const resultado = fimDoMes(null);

        expect(resultado).toBeInstanceOf(Date);
    });

    it('deve aceitar leaveReturnDate como Date e rotular licenca medica', () => {
        const resultado = montarPainelAfastamentosNoticias(
            [
                {
                    id: '6',
                    name: 'Fernanda',
                    status: 'LICENCA_MED',
                    leaveReturnDate: new Date('2026-06-28T00:00:00.000Z'),
                    company: { name: 'Empresa E' }
                }
            ],
            referencia
        );

        expect(resultado.voltando[0].situacao).toBe('Licença médica');
    });

    it('deve retornar null para valores invalidos em inicioDoDia', () => {
        expect(inicioDoDia(null)).toBeNull();
        expect(inicioDoDia('')).toBeNull();
        expect(inicioDoDia('data-invalida')).toBeNull();
    });

    it('deve normalizar inicio do dia a partir de Date', () => {
        const data = inicioDoDia(new Date('2026-06-22T15:30:00.000Z'));

        expect(data?.toISOString()).toBe('2026-06-22T00:00:00.000Z');
    });

    it('deve calcular ultimo dia do mes', () => {
        const ultimoDia = fimDoMes(new Date('2026-06-22T00:00:00.000Z'));

        expect(ultimoDia.toISOString()).toBe('2026-06-30T00:00:00.000Z');
    });

    it('deve retornar rotulo original para status desconhecido', () => {
        expect(rotuloStatusAfastamento('OUTRO_STATUS')).toBe('OUTRO_STATUS');
        expect(rotuloStatusAfastamento('LICENCA_MATERNIDADE')).toBe('Licença maternidade');
    });

    it('deve retornar painel vazio quando data de referencia for invalida', () => {
        expect(montarPainelAfastamentosNoticias([], null)).toEqual({ saindo: [], voltando: [] });
    });

    it('deve classificar retorno hoje como voltando no mes', () => {
        const resultado = montarPainelAfastamentosNoticias(
            [
                {
                    id: '3',
                    name: 'Carla',
                    status: 'LICENCA_MATERNIDADE',
                    leaveReturnDate: '2026-06-22T00:00:00.000Z',
                    company: 'Empresa C'
                }
            ],
            referencia
        );

        expect(resultado.voltando).toHaveLength(1);
        expect(resultado.voltando[0].empresa).toBe('—');
        expect(resultado.voltando[0].situacao).toBe('Licença maternidade');
    });

    it('deve ignorar funcionarios sem status de afastamento temporario', () => {
        const resultado = montarPainelAfastamentosNoticias(
            [{ id: '4', name: 'Diego', status: 'ATIVO' }],
            referencia
        );

        expect(resultado).toEqual({ saindo: [], voltando: [] });
    });

    it('deve listar em saindo quando nao houver previsao de retorno', () => {
        const resultado = montarPainelAfastamentosNoticias(
            [
                {
                    id: '5',
                    name: 'Edu',
                    status: 'FERIAS',
                    company: { name: 'Empresa D' }
                }
            ],
            referencia
        );

        expect(resultado.saindo).toHaveLength(1);
        expect(resultado.saindo[0].previsaoRetorno).toBe('—');
    });

    it('deve retornar mes de referencia em pt-BR', () => {
        expect(obterMesReferenciaAfastamentos(referencia)).toMatch(/junho de 2026/i);
    });

    it('deve separar quem volta no mes de quem permanece afastado', () => {
        const resultado = montarPainelAfastamentosNoticias(
            [
                {
                    id: '1',
                    name: 'Ana',
                    status: 'FERIAS',
                    leaveReturnDate: '2026-06-28T00:00:00.000Z',
                    company: { name: 'Empresa A' }
                },
                {
                    id: '2',
                    name: 'Bruno',
                    status: 'LICENCA_MED',
                    leaveReturnDate: '2026-08-10T00:00:00.000Z',
                    company: { name: 'Empresa B' }
                }
            ],
            referencia
        );

        expect(resultado.voltando).toHaveLength(1);
        expect(resultado.voltando[0].nome).toBe('Ana');
        expect(resultado.saindo).toHaveLength(1);
        expect(resultado.saindo[0].nome).toBe('Bruno');
        expect(resultado.saindo[0].previsaoRetorno).toBe('10/08/2026');
    });
});
