import { jest } from '@jest/globals';

const roleRepositoryMock = {
    create: jest.fn(),
    findByName: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleRepository.js', () => ({
    default: roleRepositoryMock,
}));

const createRoleService = (await import('./CreateRoleService.js')).default;

describe('CreateRoleService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new role successfully', async () => {
        const roleData = { name: 'ADMIN', description: 'Admin role' };
        const createdRole = { id: 1, ...roleData };

        roleRepositoryMock.findByName.mockResolvedValue(null);
        roleRepositoryMock.create.mockResolvedValue(createdRole);

        const result = await createRoleService.execute(roleData);

        expect(roleRepositoryMock.findByName).toHaveBeenCalledWith('ADMIN');
        expect(roleRepositoryMock.create).toHaveBeenCalledWith('ADMIN', 'Admin role');
        expect(result).toEqual(createdRole);
    });

    it('should throw an error if role already exists', async () => {
        const roleData = { name: 'ADMIN', description: 'Admin role' };
        const existingRole = { id: 1, ...roleData };

        roleRepositoryMock.findByName.mockResolvedValue(existingRole);
        
        await expect(createRoleService.execute(roleData)).rejects.toThrow('Role already exists.');
        
        expect(roleRepositoryMock.create).not.toHaveBeenCalled();
    });
});
