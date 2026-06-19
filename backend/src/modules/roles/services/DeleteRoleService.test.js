import { jest } from '@jest/globals';

const roleRepositoryMock = {
    exists: jest.fn(),
    softDelete: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleRepository.js', () => ({
    default: roleRepositoryMock
}));

const deleteRoleService = (await import('./DeleteRoleService.js')).default;

describe('DeleteRoleService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve excluir cargo quando existe', async () => {
        roleRepositoryMock.exists.mockResolvedValue(true);
        roleRepositoryMock.softDelete.mockResolvedValue({ id: '1' });

        await deleteRoleService.execute('1');

        expect(roleRepositoryMock.exists).toHaveBeenCalledWith('1');
        expect(roleRepositoryMock.softDelete).toHaveBeenCalledWith('1');
    });

    it('deve lancar erro 404 quando cargo nao existe', async () => {
        roleRepositoryMock.exists.mockResolvedValue(false);

        await expect(deleteRoleService.execute('99')).rejects.toMatchObject({
            message: 'Cargo não encontrado',
            statusCode: 404
        });

        expect(roleRepositoryMock.softDelete).not.toHaveBeenCalled();
    });
});
