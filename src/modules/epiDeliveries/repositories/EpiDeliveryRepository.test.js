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
});
