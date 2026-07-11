import { jest } from '@jest/globals';

const prismaMock = {
    epiDelivery: {
        createMany: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn()
    },
    roleEpi: {
        findMany: jest.fn()
    },
    employee: {
        findMany: jest.fn(),
        findFirst: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const epiDeliveryRepository = (await import('./EpiDeliveryRepository.js')).default;

describe('EpiDeliveryRepository', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('createBatch should call prisma.createMany', async () => {
        prismaMock.epiDelivery.createMany.mockResolvedValue({ count: 2 });
        const result = await epiDeliveryRepository.createBatch([{ id: 1 }, { id: 2 }]);
        
        expect(result).toEqual({ count: 2 });
        expect(prismaMock.epiDelivery.createMany).toHaveBeenCalledWith({ data: [{ id: 1 }, { id: 2 }] });
    });

    it('findByEmployeeId should call prisma.findMany', async () => {
        prismaMock.epiDelivery.findMany.mockResolvedValue([{ id: 1 }]);
        const result = await epiDeliveryRepository.findByEmployeeId('emp1');
        
        expect(result).toEqual([{ id: 1 }]);
        expect(prismaMock.epiDelivery.findMany).toHaveBeenCalled();
    });

    it('findRoleEpisByRoleId should call prisma.findMany', async () => {
        prismaMock.roleEpi.findMany.mockResolvedValue([{ id: 1 }]);
        const result = await epiDeliveryRepository.findRoleEpisByRoleId('role1');
        
        expect(result).toEqual([{ id: 1 }]);
        expect(prismaMock.roleEpi.findMany).toHaveBeenCalled();
    });

    it('findDeliveriesByEmployeeIdAndDeliveryDateRange should filter by deliveryDate', async () => {
        prismaMock.epiDelivery.findMany.mockResolvedValue([{ id: 'd1' }]);
        const limiteInicial = new Date('2026-02-01T00:00:00.000Z');
        const limiteFinal = new Date('2026-02-15T23:59:59.999Z');
        const resultado = await epiDeliveryRepository.findDeliveriesByEmployeeIdAndDeliveryDateRange(
            'emp1',
            limiteInicial,
            limiteFinal
        );
        expect(resultado).toEqual([{ id: 'd1' }]);
        expect(prismaMock.epiDelivery.findMany).toHaveBeenCalledWith({
            where: {
                employeeId: 'emp1',
                deliveryDate: { gte: limiteInicial, lte: limiteFinal }
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
    });

    it('pausarPeriodicidadePorFuncionario deve suspender vencimentos', async () => {
        const pausadoEm = new Date('2026-03-01T12:00:00.000Z');
        jest.useFakeTimers();
        jest.setSystemTime(pausadoEm);

        prismaMock.epiDelivery.findMany.mockResolvedValue([
            { id: 'd1', nextDueDate: new Date('2026-04-01T00:00:00.000Z') }
        ]);
        prismaMock.epiDelivery.update.mockResolvedValue({});

        await epiDeliveryRepository.pausarPeriodicidadePorFuncionario('emp1');

        expect(prismaMock.epiDelivery.update).toHaveBeenCalledWith({
            where: { id: 'd1' },
            data: {
                vencimentoSuspenso: new Date('2026-04-01T00:00:00.000Z'),
                periodicidadePausadaEm: pausadoEm,
                nextDueDate: null
            }
        });

        jest.useRealTimers();
    });

    it('retomarPeriodicidadePorFuncionario deve recalcular vencimentos', async () => {
        const retomadoEm = new Date('2026-03-15T12:00:00.000Z');
        const pausadoEm = new Date('2026-03-01T12:00:00.000Z');
        const vencimentoSuspenso = new Date('2026-04-01T00:00:00.000Z');
        jest.useFakeTimers();
        jest.setSystemTime(retomadoEm);

        prismaMock.epiDelivery.findMany.mockResolvedValue([
            { id: 'd1', vencimentoSuspenso, periodicidadePausadaEm: pausadoEm }
        ]);
        prismaMock.epiDelivery.update.mockResolvedValue({});

        await epiDeliveryRepository.retomarPeriodicidadePorFuncionario('emp1');

        const duracaoPausaMs = retomadoEm.getTime() - pausadoEm.getTime();
        const novoVencimento = new Date(vencimentoSuspenso.getTime() + duracaoPausaMs);

        expect(prismaMock.epiDelivery.update).toHaveBeenCalledWith({
            where: { id: 'd1' },
            data: {
                nextDueDate: novoVencimento,
                vencimentoSuspenso: null,
                periodicidadePausadaEm: null
            }
        });

        jest.useRealTimers();
    });

    it('findFuncionariosAtivos deve buscar funcionários ativos com epis', async () => {
        prismaMock.employee.findMany.mockResolvedValue([{ id: 'e1' }]);

        const resultado = await epiDeliveryRepository.findFuncionariosAtivos();

        expect(resultado).toEqual([{ id: 'e1' }]);
        expect(prismaMock.employee.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { deletedAt: null, status: 'ATIVO' }
            })
        );
    });

    it('findFuncionarioAtivoPorId deve buscar funcionário ativo por id', async () => {
        prismaMock.employee.findFirst.mockResolvedValue({ id: 'e1' });

        const resultado = await epiDeliveryRepository.findFuncionarioAtivoPorId('e1');

        expect(resultado).toEqual({ id: 'e1' });
        expect(prismaMock.employee.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'e1', deletedAt: null, status: 'ATIVO' }
            })
        );
    });
});
