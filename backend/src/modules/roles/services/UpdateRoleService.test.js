import { jest } from '@jest/globals';

const roleRepositoryMock = {
    exists: jest.fn(),
    update: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleRepository.js', () => ({
    default: roleRepositoryMock
}));

const updateRoleService = (await import('./UpdateRoleService.js')).default;

describe('UpdateRoleService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve atualizar cargo quando existe', async () => {
        const cargoAtualizado = { id: '1', name: 'Novo nome', description: 'Nova desc' };
        roleRepositoryMock.exists.mockResolvedValue(true);
        roleRepositoryMock.update.mockResolvedValue(cargoAtualizado);

        const resultado = await updateRoleService.execute('1', {
            name: 'Novo nome',
            description: 'Nova desc'
        });

        expect(roleRepositoryMock.exists).toHaveBeenCalledWith('1');
        expect(roleRepositoryMock.update).toHaveBeenCalledWith('1', 'Novo nome', 'Nova desc');
        expect(resultado).toEqual(cargoAtualizado);
    });

    it('deve lancar erro 404 quando cargo nao existe', async () => {
        roleRepositoryMock.exists.mockResolvedValue(false);

        await expect(
            updateRoleService.execute('99', { name: 'Nome', description: 'Desc' })
        ).rejects.toMatchObject({
            message: 'Cargo não encontrado',
            statusCode: 404
        });

        expect(roleRepositoryMock.update).not.toHaveBeenCalled();
    });
});
