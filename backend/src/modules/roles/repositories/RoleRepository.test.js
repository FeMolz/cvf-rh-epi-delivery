import { jest } from '@jest/globals';

const prismaMock = {
    role: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
    },
    employee: {
        count: jest.fn(),
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock,
}));

const roleRepository = (await import('./RoleRepository.js')).default;

describe('RoleRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a role', async () => {
        const roleData = { name: 'ADMIN', description: 'Admin role' };
        const createdRole = { id: 1, ...roleData };
        prismaMock.role.create.mockResolvedValue(createdRole);

        const result = await roleRepository.create('ADMIN', 'Admin role');

        expect(prismaMock.role.create).toHaveBeenCalledWith({
            data: roleData
        });
        expect(result).toEqual(createdRole);
    });

    it('should find all active roles', async () => {
        const roles = [{ id: 1, name: 'ADMIN', _count: { roleEpis: 2 } }];
        prismaMock.role.findMany.mockResolvedValue(roles);

        const result = await roleRepository.findAll();

        expect(prismaMock.role.findMany).toHaveBeenCalledWith({
            where: { deletedAt: null },
            include: {
                _count: {
                    select: { roleEpis: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        expect(result).toEqual(roles);
    });

    it('should find all roles including inactive', async () => {
        prismaMock.role.findMany.mockResolvedValue([]);

        await roleRepository.findAll({ incluirInativos: true });

        expect(prismaMock.role.findMany).toHaveBeenCalledWith({
            where: undefined,
            include: {
                _count: {
                    select: { roleEpis: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    });

    it('should find all inactive roles', async () => {
        prismaMock.role.findMany.mockResolvedValue([]);

        await roleRepository.findAll({ apenasInativos: true });

        expect(prismaMock.role.findMany).toHaveBeenCalledWith({
            where: { deletedAt: { not: null } },
            include: {
                _count: {
                    select: { roleEpis: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    });

    it('should find role by id', async () => {
        const role = { id: 1, name: 'ADMIN', _count: { roleEpis: 0 } };
        prismaMock.role.findUnique.mockResolvedValue(role);

        const result = await roleRepository.findById(1);

        expect(prismaMock.role.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            include: {
                _count: {
                    select: { roleEpis: true }
                }
            }
        });
        expect(result).toEqual(role);
    });

    it('should find active role by name', async () => {
        const role = { id: 1, name: 'ADMIN' };
        prismaMock.role.findFirst.mockResolvedValue(role);

        const result = await roleRepository.findByName('ADMIN');

        expect(prismaMock.role.findFirst).toHaveBeenCalledWith({
            where: { name: 'ADMIN', deletedAt: null }
        });
        expect(result).toEqual(role);
    });

    it('should update a role', async () => {
        const roleData = { id: 1, name: 'ADMIN_UPDATED', description: 'Updated' };
        prismaMock.role.update.mockResolvedValue(roleData);

        const result = await roleRepository.update(1, 'ADMIN_UPDATED', 'Updated');

        expect(prismaMock.role.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { name: 'ADMIN_UPDATED', description: 'Updated' }
        });
        expect(result).toEqual(roleData);
    });

    it('should soft delete a role', async () => {
        const roleData = { id: 1, name: 'ADMIN', deletedAt: new Date() };
        prismaMock.role.update.mockResolvedValue(roleData);

        const result = await roleRepository.softDelete(1);

        expect(prismaMock.role.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { deletedAt: expect.any(Date) }
        });
        expect(result).toEqual(roleData);
    });

    it('should count active roles', async () => {
        prismaMock.role.count.mockResolvedValue(5);

        const result = await roleRepository.count();

        expect(prismaMock.role.count).toHaveBeenCalledWith({
            where: { deletedAt: null }
        });
        expect(result).toBe(5);
    });

    it('should check if active role exists', async () => {
        prismaMock.role.count.mockResolvedValue(1);

        const result = await roleRepository.exists(1);

        expect(prismaMock.role.count).toHaveBeenCalledWith({
            where: { id: 1, deletedAt: null }
        });
        expect(result).toBe(true);
    });

    it('should return false if active role does not exist', async () => {
        prismaMock.role.count.mockResolvedValue(0);

        const result = await roleRepository.exists(1);

        expect(result).toBe(false);
    });

    it('should count active employees linked to a role', async () => {
        prismaMock.employee.count.mockResolvedValue(3);

        const result = await roleRepository.countEmployeesByRoleId('cargo-1');

        expect(prismaMock.employee.count).toHaveBeenCalledWith({
            where: {
                roleId: 'cargo-1',
                deletedAt: null
            }
        });
        expect(result).toBe(3);
    });

    it('should check if name is unique among active roles', async () => {
        prismaMock.role.count.mockResolvedValue(0);

        const result = await roleRepository.isNameUnique('ADMIN');

        expect(prismaMock.role.count).toHaveBeenCalledWith({
            where: { name: 'ADMIN', deletedAt: null }
        });
        expect(result).toBe(true);
    });

    it('should check if name is unique ignoring own id', async () => {
        prismaMock.role.count.mockResolvedValue(0);

        const result = await roleRepository.isNameUnique('ADMIN', 1);

        expect(prismaMock.role.count).toHaveBeenCalledWith({
            where: {
                name: 'ADMIN',
                deletedAt: null,
                id: { not: 1 }
            }
        });
        expect(result).toBe(true);
    });
});
