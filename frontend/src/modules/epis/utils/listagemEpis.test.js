import { describe, expect, it } from 'vitest';

import {
    epiEstaAtivo,
    filtrarEpis,
    filtrarEpisCacheDisponiveisParaVinculo,
    filtrarEpisPorSituacao,
    filtrarVinculosEpiCargo,
    formatarDataValidadeEpi,
    normalizarVinculoEpiCargo,
    obterClasseStatusEpi,
    obterRotuloStatusEpi
} from './listagemEpis.js';

describe('listagemEpis', () => {
    const epis = [
        { id: '1', name: 'Capacete', caNumber: '11070', isActive: true },
        { id: '2', name: 'Luva', caNumber: '22080', isActive: false }
    ];

    it('deve identificar status do epi', () => {
        expect(epiEstaAtivo(epis[0])).toBe(true);
        expect(epiEstaAtivo(epis[1])).toBe(false);
        expect(obterRotuloStatusEpi(epis[0])).toBe('Ativo');
        expect(obterRotuloStatusEpi(epis[1])).toBe('Inativo');
        expect(obterClasseStatusEpi(epis[1])).toBe('status-badge status-badge--offline');
    });

    it('deve formatar data de validade', () => {
        expect(formatarDataValidadeEpi(null)).toBe('—');
        expect(formatarDataValidadeEpi('invalido')).toBe('—');
        expect(formatarDataValidadeEpi('2027-01-15')).toMatch(/\d{2}\/\d{2}\/\d{2,4}/);
        expect(formatarDataValidadeEpi(new Date('2027-01-15'))).toMatch(/\d{2}\/\d{2}\/\d{2,4}/);
    });

    it('deve filtrar epis ativos', () => {
        expect(filtrarEpisPorSituacao(epis, false)).toHaveLength(1);
        expect(filtrarEpisPorSituacao(epis, true)).toHaveLength(1);
    });

    it('deve filtrar epis por termo de busca', () => {
        expect(filtrarEpis(epis, 'capacete')).toHaveLength(1);
        expect(filtrarEpis(epis, '')).toHaveLength(2);
        expect(filtrarEpis(epis, 'inativo')).toHaveLength(1);
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

        expect(
            normalizarVinculoEpiCargo({
                epiId: 'e2',
                periodicityDays: '45'
            })
        ).toMatchObject({
            epiId: 'e2',
            periodicityDays: 45
        });

        expect(
            normalizarVinculoEpiCargo({
                id: 'v2',
                periodicityDays: 0
            })
        ).toMatchObject({
            periodicityDays: 0
        });
    });

    it('deve filtrar vinculos por termo de busca', () => {
        const vinculos = [
            {
                id: 'v1',
                periodicityDays: 90,
                epi: { id: 'e1', name: 'Capacete', caNumber: '11070', isActive: true }
            }
        ];

        expect(filtrarVinculosEpiCargo(vinculos, '11070')).toHaveLength(1);
        expect(filtrarVinculosEpiCargo(vinculos, '')).toHaveLength(1);
        expect(filtrarVinculosEpiCargo(vinculos, 'inexistente')).toHaveLength(0);
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
        expect(filtrarEpisCacheDisponiveisParaVinculo(epis, [])).toHaveLength(1);
    });
});
