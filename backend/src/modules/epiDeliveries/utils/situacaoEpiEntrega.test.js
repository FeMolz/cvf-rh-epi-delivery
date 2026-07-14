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
    it('deve montar situacao com entregas e vinculos ausentes', () => {
        const epis = montarSituacaoEpisFuncionario({
            role: {
                roleEpis: [{ periodicityDays: 30, epi: undefined }]
            }
        });

        expect(epis[0].lastDeliveryDate).toBeNull();
        expect(epis[0].nextDueDate).toBeNull();
    });

    it('deve considerar vencimento no inicio do dia como em dia', () => {
        const hoje = obterInicioDoDia();

        expect(
            calcularSituacaoEpiEntrega({
                periodicityDays: 90,
                ultimaEntrega: { nextDueDate: hoje.toISOString() }
            })
        ).toBe(SITUACAO_EPI_ENTREGA.EM_DIA);
    });

    it('deve pular entrega duplicada do mesmo epi no agrupamento', () => {
        const mapa = agruparUltimasEntregasPorEpi([
            { epiId: 'e1', deliveryDate: '2025-01-01' },
            { epiId: 'e1', deliveryDate: '2025-06-01' }
        ]);

        expect(mapa.size).toBe(1);
        expect(mapa.get('e1')?.deliveryDate).toBe('2025-01-01');
    });

    it('deve usar nome padrao em epis vencidos sem nome de funcionario', () => {
        const ontem = new Date(obterInicioDoDia());
        ontem.setDate(ontem.getDate() - 1);

        const vencidos = montarEpisVencidosPorFuncionarios([
            {
                id: 'f9',
                epiDeliveries: [
                    {
                        epiId: 'e1',
                        nextDueDate: ontem.toISOString(),
                        epi: { id: 'e1' }
                    }
                ],
                role: {
                    roleEpis: [{ periodicityDays: 90, epi: { id: 'e1', name: 'Luva', caNumber: '9' } }]
                }
            }
        ]);

        expect(vencidos[0].employeeName).toBe('—');
    });

    it('deve agrupar por epi.id quando epiId estiver ausente', () => {
        const mapa = agruparUltimasEntregasPorEpi([
            { epi: { id: 'e1' }, deliveryDate: '2025-01-01' }
        ]);

        expect(mapa.get('e1')?.deliveryDate).toBe('2025-01-01');
    });

    it('deve ignorar entregas sem identificador de epi', () => {
        const mapa = agruparUltimasEntregasPorEpi([
            { deliveryDate: '2025-01-01' },
            { epiId: '', deliveryDate: '2025-02-01' }
        ]);

        expect(mapa.size).toBe(0);
    });

    it('deve agrupar apenas a entrega mais recente por epi', () => {
        const mapa = agruparUltimasEntregasPorEpi([
            { epiId: 'e1', deliveryDate: '2025-01-01' },
            { epiId: 'e1', deliveryDate: '2025-06-01' },
            { epiId: 'e2', deliveryDate: '2025-02-01' }
        ]);

        expect(mapa.get('e1')?.deliveryDate).toBe('2025-01-01');
        expect(mapa.get('e2')?.deliveryDate).toBe('2025-02-01');
    });

    it('deve marcar epi como sem periodicidade quando periodicidade for zero', () => {
        expect(
            calcularSituacaoEpiEntrega({
                periodicityDays: 0,
                ultimaEntrega: { nextDueDate: '2025-01-01' }
            })
        ).toBe(SITUACAO_EPI_ENTREGA.SEM_PERIODICIDADE);
    });

    it('deve marcar epi como em dia quando vencimento ainda nao passou', () => {
        const amanha = new Date(obterInicioDoDia());
        amanha.setDate(amanha.getDate() + 1);

        expect(
            calcularSituacaoEpiEntrega({
                periodicityDays: 90,
                ultimaEntrega: { nextDueDate: amanha.toISOString() }
            })
        ).toBe(SITUACAO_EPI_ENTREGA.EM_DIA);
    });

    it('deve usar vencimentoSuspenso quando nextDueDate estiver ausente', () => {
        const amanha = new Date(obterInicioDoDia());
        amanha.setDate(amanha.getDate() + 2);

        expect(
            calcularSituacaoEpiEntrega({
                periodicityDays: 90,
                ultimaEntrega: { vencimentoSuspenso: amanha.toISOString() }
            })
        ).toBe(SITUACAO_EPI_ENTREGA.EM_DIA);
    });

    it('deve marcar como pendente quando entrega existir sem proximo vencimento', () => {
        expect(
            calcularSituacaoEpiEntrega({
                periodicityDays: 90,
                ultimaEntrega: { deliveryDate: '2025-01-01' }
            })
        ).toBe(SITUACAO_EPI_ENTREGA.PENDENTE);
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

    it('deve indicar quando epi precisa de entrega', () => {
        expect(epiPrecisaEntrega(SITUACAO_EPI_ENTREGA.VENCIDO)).toBe(true);
        expect(epiPrecisaEntrega(SITUACAO_EPI_ENTREGA.PENDENTE)).toBe(true);
        expect(epiPrecisaEntrega(SITUACAO_EPI_ENTREGA.EM_DIA)).toBe(false);
        expect(epiPrecisaEntrega(SITUACAO_EPI_ENTREGA.SEM_PERIODICIDADE)).toBe(false);
    });

    it('deve ignorar epis que nao estao vencidos e usar nome padrao do funcionario', () => {
        const amanha = new Date(obterInicioDoDia());
        amanha.setDate(amanha.getDate() + 1);

        const vencidos = montarEpisVencidosPorFuncionarios([
            {
                id: 'f1',
                name: '',
                epiDeliveries: [
                    {
                        epiId: 'e1',
                        nextDueDate: amanha.toISOString(),
                        epi: { id: 'e1' }
                    }
                ],
                role: {
                    roleEpis: [{ periodicityDays: 90, epi: { id: 'e1', name: 'Capacete', caNumber: '1' } }]
                }
            }
        ]);

        expect(vencidos).toEqual([]);
    });

    it('deve retornar lista vazia quando funcionario nao tiver cargo', () => {
        expect(montarSituacaoEpisFuncionario({ epiDeliveries: [] })).toEqual([]);
    });

    it('deve ordenar epis vencidos por nome do funcionario', () => {
        const ontem = new Date(obterInicioDoDia());
        ontem.setDate(ontem.getDate() - 1);

        const vencidos = montarEpisVencidosPorFuncionarios([
            {
                id: 'f2',
                name: 'Zeca',
                epiDeliveries: [
                    {
                        epiId: 'e1',
                        nextDueDate: ontem.toISOString(),
                        epi: { id: 'e1' }
                    }
                ],
                role: {
                    roleEpis: [{ periodicityDays: 90, epi: { id: 'e1', name: 'Luva', caNumber: '1' } }]
                }
            },
            {
                id: 'f1',
                name: 'Ana',
                epiDeliveries: [
                    {
                        epiId: 'e1',
                        nextDueDate: ontem.toISOString(),
                        epi: { id: 'e1' }
                    }
                ],
                role: {
                    roleEpis: [{ periodicityDays: 90, epi: { id: 'e1', name: 'Capacete', caNumber: '2' } }]
                }
            }
        ]);

        expect(vencidos[0].employeeName).toBe('Ana');
        expect(vencidos[1].employeeName).toBe('Zeca');
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

    it('deve preencher valores padrao quando epi estiver incompleto', () => {
        const epis = montarSituacaoEpisFuncionario({
            epiDeliveries: [],
            role: {
                roleEpis: [{ periodicityDays: null, epi: {} }]
            }
        });

        expect(epis[0]).toMatchObject({
            epiId: '',
            name: '—',
            caNumber: '—',
            periodicityDays: 0,
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

    it('deve contar sem periodicidade como em dia no resumo', () => {
        expect(
            montarResumoContagemEpis([{ situacao: SITUACAO_EPI_ENTREGA.SEM_PERIODICIDADE }])
        ).toEqual({
            totalEpis: 1,
            vencidos: 0,
            pendentes: 0,
            emDia: 1
        });
    });

    it('deve normalizar inicio do dia com referencia customizada', () => {
        const inicio = obterInicioDoDia('2025-08-15T18:30:00.000Z');

        expect(inicio.getHours()).toBe(0);
        expect(inicio.getMinutes()).toBe(0);
    });
});
