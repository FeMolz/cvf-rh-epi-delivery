import { jest } from '@jest/globals';

const prismaMock = {
    epi: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn()
    },
    roleEpi: {
        findUnique: jest.fn(),
        update: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const epiRepository = (await import('./EpiRepository.js')).default;

describe('EpiRepository', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('findByCaNumber deve consultar pelo caNumber como string', async () => {
        prismaMock.epi.findUnique.mockResolvedValue({ id: '1', caNumber: '11070' });
        const resultado = await epiRepository.findByCaNumber(11070);
        expect(resultado).toEqual({ id: '1', caNumber: '11070' });
        expect(prismaMock.epi.findUnique).toHaveBeenCalledWith({
            where: { caNumber: '11070' }
        });
    });

    it('createEpi deve persistir o registro', async () => {
        const criado = { id: '2', caNumber: '11070' };
        prismaMock.epi.create.mockResolvedValue(criado);
        const resultado = await epiRepository.createEpi({
            caNumber: '11070',
            name: 'Capacete',
            caExpirationDate: new Date(),
            isActive: true
        });
        expect(resultado).toEqual(criado);
        expect(prismaMock.epi.create).toHaveBeenCalled();
    });

    it('findAllEpis deve listar todos', async () => {
        prismaMock.epi.findMany.mockResolvedValue([{ id: '1' }]);
        const resultado = await epiRepository.findAllEpis();
        expect(resultado).toEqual([{ id: '1' }]);
        expect(prismaMock.epi.findMany).toHaveBeenCalledWith();
    });

    it('findAtivosPorNomeContendo deve filtrar por nome', async () => {
        prismaMock.epi.findMany.mockResolvedValue([{ caNumber: '11070', name: 'Capacete' }]);
        const resultado = await epiRepository.findAtivosPorNomeContendo('cap', 10);
        expect(resultado).toEqual([{ caNumber: '11070', name: 'Capacete' }]);
        expect(prismaMock.epi.findMany).toHaveBeenCalledWith({
            where: {
                isActive: true,
                name: {
                    contains: 'cap',
                    mode: 'insensitive'
                }
            },
            take: 10,
            select: {
                caNumber: true,
                name: true
            },
            orderBy: { name: 'asc' }
        });
    });

    it('findRoleEpiByCompositeKey deve buscar vínculo', async () => {
        prismaMock.roleEpi.findUnique.mockResolvedValue({ id: 're1' });
        const resultado = await epiRepository.findRoleEpiByCompositeKey('r1', 'e1');
        expect(resultado).toEqual({ id: 're1' });
        expect(prismaMock.roleEpi.findUnique).toHaveBeenCalledWith({
            where: { roleId_epiId: { roleId: 'r1', epiId: 'e1' } }
        });
    });

    it('updateRoleEpiPeriodicity deve atualizar periodicidade', async () => {
        prismaMock.roleEpi.update.mockResolvedValue({ periodicityDays: 90 });
        const resultado = await epiRepository.updateRoleEpiPeriodicity('r1', 'e1', 90);
        expect(resultado.periodicityDays).toBe(90);
        expect(prismaMock.roleEpi.update).toHaveBeenCalledWith({
            where: { roleId_epiId: { roleId: 'r1', epiId: 'e1' } },
            data: { periodicityDays: 90 }
        });
    });
});
