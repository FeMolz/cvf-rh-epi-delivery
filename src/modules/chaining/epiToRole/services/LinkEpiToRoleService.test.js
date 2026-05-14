import { jest } from '@jest/globals';

const prismaMock = {
    role: {
        findUnique: jest.fn()
    },
    roleEpi: {
        findUnique: jest.fn(),
        create: jest.fn()
    }
};

const fetchEpiFromApiServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../../../../config/database.js', () => ({
    default: prismaMock
}));

jest.unstable_mockModule('../../../epis/services/FetchEpiFromApiService.js', () => ({
    default: fetchEpiFromApiServiceMock
}));

const linkEpiToRoleService = (await import('./LinkEpiToRoleService.js')).default;

describe('LinkEpiToRoleService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should throw error if fields are missing', async () => {
        await expect(linkEpiToRoleService.execute({ roleId: '1' })).rejects.toThrow('roleId, caNumber e periodicityDays são obrigatórios.');
    });

    it('should throw error if role does not exist', async () => {
        prismaMock.role.findUnique.mockResolvedValue(null);
        await expect(linkEpiToRoleService.execute({ roleId: '1', caNumber: '11070', periodicityDays: 180 })).rejects.toThrow('Cargo não encontrado.');
    });

    it('should throw error if link already exists', async () => {
        prismaMock.role.findUnique.mockResolvedValue({ id: '1' });
        fetchEpiFromApiServiceMock.execute.mockResolvedValue({ id: '2' });
        prismaMock.roleEpi.findUnique.mockResolvedValue({ id: '3' }); // Exists

        await expect(linkEpiToRoleService.execute({ roleId: '1', caNumber: '11070', periodicityDays: 180 })).rejects.toThrow('Este EPI já está vinculado a este Cargo.');
    });

    it('should create link if everything is valid', async () => {
        prismaMock.role.findUnique.mockResolvedValue({ id: '1' });
        fetchEpiFromApiServiceMock.execute.mockResolvedValue({ id: '2' });
        prismaMock.roleEpi.findUnique.mockResolvedValue(null);
        prismaMock.roleEpi.create.mockResolvedValue({ roleId: '1', epiId: '2', periodicityDays: 180 });

        const result = await linkEpiToRoleService.execute({ roleId: '1', caNumber: '11070', periodicityDays: 180 });
        expect(result).toEqual({ roleId: '1', epiId: '2', periodicityDays: 180 });
        expect(prismaMock.roleEpi.create).toHaveBeenCalled();
    });
});
