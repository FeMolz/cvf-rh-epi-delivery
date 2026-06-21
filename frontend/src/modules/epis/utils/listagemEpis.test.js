import { describe, expect, it } from 'vitest';

import {
    filtrarEpis,
    filtrarEpisCacheDisponiveisParaVinculo,
    filtrarEpisPorSituacao,
    normalizarVinculoEpiCargo
} from './listagemEpis.js';

describe('listagemEpis', () => {
    const epis = [
        { id: '1', name: 'Capacete', caNumber: '11070', isActive: true },
        { id: '2', name: 'Luva', caNumber: '22080', isActive: false }
    ];

    it('deve filtrar epis ativos', () => {
        expect(filtrarEpisPorSituacao(epis, false)).toHaveLength(1);
        expect(filtrarEpisPorSituacao(epis, true)).toHaveLength(1);
    });

    it('deve filtrar epis por termo de busca', () => {
        expect(filtrarEpis(epis, 'capacete')).toHaveLength(1);
    });

    it('deve normalizar vinculo de epi com cargo', () => {
        expect(
            normalizarVinculoEpiCargo({
                id: 'v1',
                periodicityDays: 90,
                epi: { id: 'e1', name: 'Capacete', caNumber: '11070', isActive: true }
            })
        ).toMatchObject({
            vinculoId: 'v1',
            epiId: 'e1',
            name: 'Capacete',
            periodicityDays: 90
        });
    });

    it('deve listar epis em cache ainda nao vinculados', () => {
        const vinculos = [
            {
                id: 'v1',
                periodicityDays: 90,
                epi: { id: '1', name: 'Capacete', caNumber: '11070', isActive: true }
            }
        ];

        expect(filtrarEpisCacheDisponiveisParaVinculo(epis, vinculos)).toEqual([]);
    });
});
