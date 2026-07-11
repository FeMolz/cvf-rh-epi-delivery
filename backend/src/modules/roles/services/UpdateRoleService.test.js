import { jest } from '@jest/globals';

const roleRepositoryMock = {
    exists: jest.fn(),
    findActiveByNameIgnoringCase: jest.fn(),
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
        roleRepositoryMock.findActiveByNameIgnoringCase.mockResolvedValue(null);
        roleRepositoryMock.update.mockResolvedValue(cargoAtualizado);

        const resultado = await updateRoleService.execute('1', {
            name: 'Novo nome',
            description: 'Nova desc'
        });

        expect(roleRepositoryMock.exists).toHaveBeenCalledWith('1');
        expect(roleRepositoryMock.findActiveByNameIgnoringCase).toHaveBeenCalledWith('Novo nome', '1');
        expect(roleRepositoryMock.update).toHaveBeenCalledWith('1', 'Novo nome', 'Nova desc');
        expect(resultado).toEqual(cargoAtualizado);
    });

    it('deve rejeitar atualizacao com nome duplicado', async () => {
        roleRepositoryMock.exists.mockResolvedValue(true);
        roleRepositoryMock.findActiveByNameIgnoringCase.mockResolvedValue({
            id: '2',
            name: 'Eng de Minas'
        });

        await expect(
            updateRoleService.execute('1', { name: 'Eng De Minas', description: 'Desc' })
        ).rejects.toMatchObject({
            message: 'Já existe um cargo ativo com este nome. Verifique a grafia e tente novamente.',
            statusCode: 400
        });

        expect(roleRepositoryMock.update).not.toHaveBeenCalled();
    });

    it('deve lancar erro 404 quando cargo nao existe', async () => {
        roleRepositoryMock.exists.mockResolvedValue(false);

        await expect(
            updateRoleService.execute('99', { name: 'Nome', description: 'Desc' })
        ).rejects.toMatchObject({
            message: 'Cargo não encontrado.',
            statusCode: 404
        });

        expect(roleRepositoryMock.update).not.toHaveBeenCalled();
    });

    it('deve rejeitar atualizacao com nome vazio apos formatacao', async () => {
        roleRepositoryMock.exists.mockResolvedValue(true);

        await expect(
            updateRoleService.execute('1', { name: '   ', description: 'Desc' })
        ).rejects.toMatchObject({
            message: 'O nome do cargo é obrigatório.',
            statusCode: 400
        });

        expect(roleRepositoryMock.update).not.toHaveBeenCalled();
    });
});
