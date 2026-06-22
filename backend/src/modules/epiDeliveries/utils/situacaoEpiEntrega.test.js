import { describe, expect, it } from '@jest/globals';

import {
    SITUACAO_EPI_ENTREGA,
    agruparUltimasEntregasPorEpi,
    calcularSituacaoEpiEntrega,
    epiPrecisaEntrega,
    montarEpisVencidosPorFuncionarios,
    montarResumoContagemEpis,
    montarSituacaoEpisFuncionario,
    obterInicioDoDia
} from './situacaoEpiEntrega.js';

describe('situacaoEpiEntrega', () => {
    it('deve agrupar apenas a entrega mais recente por epi', () => {
        const mapa = agruparUltimasEntregasPorEpi([
            { epiId: 'e1', deliveryDate: '2025-01-01' },
            { epiId: 'e1', deliveryDate: '2025-06-01' },
            { epiId: 'e2', deliveryDate: '2025-02-01' }
        ]);

        expect(mapa.get('e1')?.deliveryDate).toBe('2025-01-01');
        expect(mapa.get('e2')?.deliveryDate).toBe('2025-02-01');
    });

    it('deve marcar epi como pendente sem entrega', () => {
        expect(
            calcularSituacaoEpiEntrega({ periodicityDays: 90, ultimaEntrega: null })
        ).toBe(SITUACAO_EPI_ENTREGA.PENDENTE);
    });

    it('deve marcar epi como vencido quando nextDueDate passou', () => {
        const ontem = new Date(obterInicioDoDia());
        ontem.setDate(ontem.getDate() - 1);

        expect(
            calcularSituacaoEpiEntrega({
                periodicityDays: 90,
                ultimaEntrega: { nextDueDate: ontem.toISOString() }
            })
        ).toBe(SITUACAO_EPI_ENTREGA.VENCIDO);
    });

    it('deve montar epis vencidos apenas dos funcionarios elegiveis', () => {
        const ontem = new Date(obterInicioDoDia());
        ontem.setDate(ontem.getDate() - 1);

        const funcionarios = [
            {
                id: 'f1',
                name: 'Ana',
                epiDeliveries: [
                    {
                        epiId: 'e1',
                        deliveryDate: '2025-01-01',
                        nextDueDate: ontem.toISOString(),
                        epi: { id: 'e1' }
                    }
                ],
                role: {
                    roleEpis: [
                        {
                            periodicityDays: 90,
                            epi: { id: 'e1', name: 'Capacete', caNumber: '11070' }
                        }
                    ]
                }
            }
        ];

        const vencidos = montarEpisVencidosPorFuncionarios(funcionarios);

        expect(vencidos).toHaveLength(1);
        expect(vencidos[0]).toMatchObject({
            employeeId: 'f1',
            employeeName: 'Ana',
            caNumber: '11070'
        });
    });

    it('deve indicar quando epi precisa de entrega', () => {
        expect(epiPrecisaEntrega(SITUACAO_EPI_ENTREGA.VENCIDO)).toBe(true);
        expect(epiPrecisaEntrega(SITUACAO_EPI_ENTREGA.EM_DIA)).toBe(false);
    });

    it('deve montar situacao completa dos epis do cargo', () => {
        const epis = montarSituacaoEpisFuncionario({
            id: 'f1',
            epiDeliveries: [],
            role: {
                roleEpis: [
                    {
                        periodicityDays: 180,
                        epi: {
                            id: 'e1',
                            name: 'Luva',
                            caNumber: '22080',
                            caExpirationDate: '2027-01-01'
                        }
                    }
                ]
            }
        });

        expect(epis[0]).toMatchObject({
            epiId: 'e1',
            name: 'Luva',
            situacao: SITUACAO_EPI_ENTREGA.PENDENTE
        });
    });

    it('deve montar resumo de contagem dos epis', () => {
        expect(
            montarResumoContagemEpis([
                { situacao: SITUACAO_EPI_ENTREGA.VENCIDO },
                { situacao: SITUACAO_EPI_ENTREGA.PENDENTE },
                { situacao: SITUACAO_EPI_ENTREGA.EM_DIA }
            ])
        ).toEqual({
            totalEpis: 3,
            vencidos: 1,
            pendentes: 1,
            emDia: 1
        });
    });
});
