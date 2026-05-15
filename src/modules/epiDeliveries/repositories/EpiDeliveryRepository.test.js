import { jest } from '@jest/globals';

const prismaMock = {
    epiDelivery: {
        createMany: jest.fn(),
        findMany: jest.fn()
    },
    roleEpi: {
        findMany: jest.fn()
    },
    employee: {
        findUnique: jest.fn()
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

    it('findEmployeeById should call prisma.findUnique', async () => {
        prismaMock.employee.findUnique.mockResolvedValue({ id: 'emp1' });
        const result = await epiDeliveryRepository.findEmployeeById('emp1');
        
        expect(result).toEqual({ id: 'emp1' });
        expect(prismaMock.employee.findUnique).toHaveBeenCalled();
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
});
