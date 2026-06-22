import { jest } from '@jest/globals';

import { montarEntregasTabelaRelatorio } from './montarEntregasTabelaRelatorio.js';

describe('montarEntregasTabelaRelatorio', () => {
    it('deve mapear entregas para o formato da tabela do relatorio', () => {
        const resultado = montarEntregasTabelaRelatorio([
            {
                deliveryDate: new Date('2026-01-15T00:00:00.000Z'),
                epi: { name: 'Capacete', caNumber: '11070' }
            }
        ]);

        expect(resultado).toEqual([
            {
                dataEntrega: '15/01/2026',
                nomeEquipamento: 'Capacete',
                numeroCa: '11070'
            }
        ]);
    });
});
