import { jest } from '@jest/globals';

const roleQuesitoRepositoryMock = {
    findByRoleIdAndQuesitoId: jest.fn(),
    deleteByRoleIdAndQuesitoId: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleQuesitoRepository.js', () => ({
    default: roleQuesitoRepositoryMock
}));

const unlinkQuesitoFromRoleService = (await import('./UnlinkQuesitoFromRoleService.js')).default;

describe('UnlinkQuesitoFromRoleService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve rejeitar quando roleId ou quesitoId faltam', async () => {
        await expect(unlinkQuesitoFromRoleService.execute({ roleId: '1' })).rejects.toThrow(
            'roleId e quesitoId sao obrigatorios.'
        );
    });

    it('deve rejeitar quando vinculo nao existe', async () => {
        roleQuesitoRepositoryMock.findByRoleIdAndQuesitoId.mockResolvedValue(null);

        await expect(
            unlinkQuesitoFromRoleService.execute({ roleId: '1', quesitoId: '2' })
        ).rejects.toThrow('Vinculo entre cargo e quesito nao encontrado.');
    });

    it('deve remover quando vinculo existe', async () => {
        const removido = { id: 'v' };
        roleQuesitoRepositoryMock.findByRoleIdAndQuesitoId.mockResolvedValue({ id: 'v' });
        roleQuesitoRepositoryMock.deleteByRoleIdAndQuesitoId.mockResolvedValue(removido);

        const resultado = await unlinkQuesitoFromRoleService.execute({ roleId: '1', quesitoId: '2' });

        expect(roleQuesitoRepositoryMock.deleteByRoleIdAndQuesitoId).toHaveBeenCalledWith('1', '2');
        expect(resultado).toEqual(removido);
    });
});
