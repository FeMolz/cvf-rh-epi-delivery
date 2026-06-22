import { jest } from '@jest/globals';
import {
    montarPainelAfastamentosNoticias,
    formatarDataBr
} from './montarAfastamentosNoticias.js';

describe('montarAfastamentosNoticias', () => {
    const referencia = new Date('2026-06-22');

    it('deve formatar data em pt-BR', () => {
        expect(formatarDataBr(new Date('2026-06-25'))).toBe('25/06/2026');
        expect(formatarDataBr(null)).toBe('—');
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
