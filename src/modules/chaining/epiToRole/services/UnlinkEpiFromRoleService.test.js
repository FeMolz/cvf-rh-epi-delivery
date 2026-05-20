import { jest } from '@jest/globals';

const roleEpiRepositoryMock = {
    findByRoleAndEpi: jest.fn(),
    deleteByRoleAndEpi: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleEpiRepository.js', () => ({
    default: roleEpiRepositoryMock
}));

const unlinkEpiFromRoleService = (await import('./UnlinkEpiFromRoleService.js')).default;

describe('UnlinkEpiFromRoleService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve lançar erro quando campos obrigatórios estão ausentes', async () => {
        await expect(unlinkEpiFromRoleService.execute({ roleId: '1' })).rejects.toThrow(
            'roleId e epiId são obrigatórios.'
        );
    });

    it('deve lançar erro quando vínculo não existe', async () => {
        roleEpiRepositoryMock.findByRoleAndEpi.mockResolvedValue(null);
        await expect(
            unlinkEpiFromRoleService.execute({ roleId: '1', epiId: '2' })
        ).rejects.toThrow('Vínculo entre este Cargo e EPI não encontrado.');
    });

    it('deve remover vínculo quando válido', async () => {
        roleEpiRepositoryMock.findByRoleAndEpi.mockResolvedValue({ roleId: '1', epiId: '2' });
        roleEpiRepositoryMock.deleteByRoleAndEpi.mockResolvedValue({});

        const resultado = await unlinkEpiFromRoleService.execute({ roleId: '1', epiId: '2' });

        expect(resultado).toEqual({ message: 'Vínculo removido com sucesso.' });
        expect(roleEpiRepositoryMock.deleteByRoleAndEpi).toHaveBeenCalledWith('1', '2');
    });
});
