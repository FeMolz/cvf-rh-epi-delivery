import prisma from '../../../config/database.js';

class EpiDeliveryRepository {
    async createBatch(deliveriesData) {
        return prisma.epiDelivery.createMany({
            data: deliveriesData
        });
    }

    async findByEmployeeId(employeeId) {
        return prisma.epiDelivery.findMany({
            where: { employeeId },
            include: {
                epi: true,
                deliveredBy: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { deliveryDate: 'desc' }
        });
    }

    async findRoleEpisByRoleId(roleId) {
        return prisma.roleEpi.findMany({
            where: { roleId }
        });
    }

    async pausarPeriodicidadePorFuncionario(identificadorFuncionario) {
        const entregasComVencimento = await prisma.epiDelivery.findMany({
            where: {
                employeeId: identificadorFuncionario,
                nextDueDate: { not: null }
            },
            select: { id: true, nextDueDate: true }
        });

        const pausadoEm = new Date();

        for (const entrega of entregasComVencimento) {
            await prisma.epiDelivery.update({
                where: { id: entrega.id },
                data: {
                    vencimentoSuspenso: entrega.nextDueDate,
                    periodicidadePausadaEm: pausadoEm,
                    nextDueDate: null
                }
            });
        }
    }

    async retomarPeriodicidadePorFuncionario(identificadorFuncionario) {
        const entregasSuspensas = await prisma.epiDelivery.findMany({
            where: {
                employeeId: identificadorFuncionario,
                vencimentoSuspenso: { not: null },
                periodicidadePausadaEm: { not: null }
            },
            select: {
                id: true,
                vencimentoSuspenso: true,
                periodicidadePausadaEm: true
            }
        });

        const retomadoEm = new Date();

        for (const entrega of entregasSuspensas) {
            const duracaoPausaMs =
                retomadoEm.getTime() - new Date(entrega.periodicidadePausadaEm).getTime();
            const novoVencimento = new Date(
                new Date(entrega.vencimentoSuspenso).getTime() + duracaoPausaMs
            );

            await prisma.epiDelivery.update({
                where: { id: entrega.id },
                data: {
                    nextDueDate: novoVencimento,
                    vencimentoSuspenso: null,
                    periodicidadePausadaEm: null
                }
            });
        }
    }

    async findDeliveriesByEmployeeIdAndDeliveryDateRange(employeeId, dataInicio, dataFim) {
        return prisma.epiDelivery.findMany({
            where: {
                employeeId,
                deliveryDate: {
                    gte: dataInicio,
                    lte: dataFim
                }
            },
            include: {
                epi: {
                    select: {
                        id: true,
                        name: true,
                        caNumber: true
                    }
                }
            },
            orderBy: { deliveryDate: 'asc' }
        });
    }

    async findFuncionariosAtivosComEpisNoCargo() {
        return prisma.employee.findMany({
            where: {
                deletedAt: null,
                status: 'ATIVO',
                role: {
                    roleEpis: {
                        some: {}
                    }
                }
            },
            select: {
                id: true,
                name: true,
                roleId: true,
                role: {
                    select: {
                        name: true,
                        roleEpis: {
                            include: {
                                epi: {
                                    select: {
                                        id: true,
                                        name: true,
                                        caNumber: true,
                                        caExpirationDate: true,
                                        isActive: true
                                    }
                                }
                            }
                        }
                    }
                },
                epiDeliveries: {
                    orderBy: { deliveryDate: 'desc' },
                    select: {
                        id: true,
                        epiId: true,
                        deliveryDate: true,
                        nextDueDate: true,
                        vencimentoSuspenso: true,
                        periodicidadePausadaEm: true,
                        epi: {
                            select: { id: true }
                        }
                    }
                }
            },
            orderBy: [{ name: 'asc' }]
        });
    }

    async findFuncionarioAtivoComEpisNoCargoPorId(employeeId) {
        return prisma.employee.findFirst({
            where: {
                id: employeeId,
                deletedAt: null,
                status: 'ATIVO',
                role: {
                    roleEpis: {
                        some: {}
                    }
                }
            },
            select: {
                id: true,
                name: true,
                roleId: true,
                role: {
                    select: {
                        name: true,
                        roleEpis: {
                            include: {
                                epi: {
                                    select: {
                                        id: true,
                                        name: true,
                                        caNumber: true,
                                        caExpirationDate: true,
                                        isActive: true
                                    }
                                }
                            }
                        }
                    }
                },
                epiDeliveries: {
                    orderBy: { deliveryDate: 'desc' },
                    select: {
                        id: true,
                        epiId: true,
                        deliveryDate: true,
                        nextDueDate: true,
                        vencimentoSuspenso: true,
                        periodicidadePausadaEm: true,
                        epi: {
                            select: { id: true }
                        }
                    }
                }
            }
        });
    }
}

export default new EpiDeliveryRepository();
