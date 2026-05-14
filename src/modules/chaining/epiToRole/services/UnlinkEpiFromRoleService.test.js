import { jest } from '@jest/globals';

const prismaMock = {
    roleEpi: {
        findUnique: jest.fn(),
        delete: jest.fn()
    }
};

jest.unstable_mockModule('../../../../config/database.js', () => ({
    default: prismaMock
}));

const unlinkEpiFromRoleService = (await import('./UnlinkEpiFromRoleService.js')).default;

describe('UnlinkEpiFromRoleService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should throw error if fields are missing', async () => {
        await expect(unlinkEpiFromRoleService.execute({ roleId: '1' })).rejects.toThrow('roleId e epiId são obrigatórios.');
    });

    it('should throw error if link does not exist', async () => {
        prismaMock.roleEpi.findUnique.mockResolvedValue(null);
        await expect(unlinkEpiFromRoleService.execute({ roleId: '1', epiId: '2' })).rejects.toThrow('Vínculo entre este Cargo e EPI não encontrado.');
    });

    it('should delete link if valid', async () => {
        prismaMock.roleEpi.findUnique.mockResolvedValue({ roleId: '1', epiId: '2' });
        prismaMock.roleEpi.delete.mockResolvedValue({});

        const result = await unlinkEpiFromRoleService.execute({ roleId: '1', epiId: '2' });
        expect(result).toEqual({ message: 'Vínculo removido com sucesso.' });
        expect(prismaMock.roleEpi.delete).toHaveBeenCalled();
    });
});
