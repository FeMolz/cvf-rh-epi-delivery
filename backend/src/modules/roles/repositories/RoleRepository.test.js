import { jest } from '@jest/globals';

const prismaMock = {
    role: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
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

    it('should find all roles', async () => {
        const roles = [{ id: 1, name: 'ADMIN' }];
        prismaMock.role.findMany.mockResolvedValue(roles);

        const result = await roleRepository.findAll();

        expect(prismaMock.role.findMany).toHaveBeenCalled();
        expect(result).toEqual(roles);
    });

    it('should find role by id', async () => {
        const role = { id: 1, name: 'ADMIN' };
        prismaMock.role.findUnique.mockResolvedValue(role);

        const result = await roleRepository.findById(1);

        expect(prismaMock.role.findUnique).toHaveBeenCalledWith({
            where: { id: 1 }
        });
        expect(result).toEqual(role);
    });

    it('should find role by name', async () => {
        const role = { id: 1, name: 'ADMIN' };
        prismaMock.role.findUnique.mockResolvedValue(role);

        const result = await roleRepository.findByName('ADMIN');

        expect(prismaMock.role.findUnique).toHaveBeenCalledWith({
            where: { name: 'ADMIN' }
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

    it('should delete a role', async () => {
        const roleData = { id: 1, name: 'ADMIN' };
        prismaMock.role.delete.mockResolvedValue(roleData);

        const result = await roleRepository.delete(1);

        expect(prismaMock.role.delete).toHaveBeenCalledWith({
            where: { id: 1 }
        });
        expect(result).toEqual(roleData);
    });

    it('should count roles', async () => {
        prismaMock.role.count.mockResolvedValue(5);

        const result = await roleRepository.count();

        expect(prismaMock.role.count).toHaveBeenCalled();
        expect(result).toBe(5);
    });

    it('should check if role exists', async () => {
        prismaMock.role.findUnique.mockResolvedValue({ id: 1 });

        const result = await roleRepository.exists(1);

        expect(prismaMock.role.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toBe(true);
    });

    it('should return false if role does not exist', async () => {
        prismaMock.role.findUnique.mockResolvedValue(null);

        const result = await roleRepository.exists(1);

        expect(result).toBe(false);
    });

    it('should check if name is unique', async () => {
        prismaMock.role.count.mockResolvedValue(0);

        const result = await roleRepository.isNameUnique('ADMIN');

        expect(prismaMock.role.count).toHaveBeenCalledWith({
            where: { name: 'ADMIN' }
        });
        expect(result).toBe(true);
    });

    it('should check if name is unique ignoring own id', async () => {
        prismaMock.role.count.mockResolvedValue(0);

        const result = await roleRepository.isNameUnique('ADMIN', 1);

        expect(prismaMock.role.count).toHaveBeenCalledWith({
            where: {
                name: 'ADMIN',
                id: { not: 1 }
            }
        });
        expect(result).toBe(true);
    });
});
