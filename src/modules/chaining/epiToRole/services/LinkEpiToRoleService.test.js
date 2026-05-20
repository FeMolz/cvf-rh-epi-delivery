import { jest } from '@jest/globals';

const roleRepositoryMock = {
    findById: jest.fn()
};

const roleEpiRepositoryMock = {
    findByRoleAndEpi: jest.fn(),
    create: jest.fn()
};

const fetchEpiFromApiServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../../../roles/repositories/RoleRepository.js', () => ({
    default: roleRepositoryMock
}));

jest.unstable_mockModule('../repositories/RoleEpiRepository.js', () => ({
    default: roleEpiRepositoryMock
}));

jest.unstable_mockModule('../../../epis/services/FetchEpiFromApiService.js', () => ({
    default: fetchEpiFromApiServiceMock
}));

const linkEpiToRoleService = (await import('./LinkEpiToRoleService.js')).default;

describe('LinkEpiToRoleService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve lançar erro quando campos obrigatórios estão ausentes', async () => {
        await expect(linkEpiToRoleService.execute({ roleId: '1' })).rejects.toThrow(
            'roleId, caNumber e periodicityDays são obrigatórios.'
        );
    });

    it('deve lançar erro quando cargo não existe', async () => {
        roleRepositoryMock.findById.mockResolvedValue(null);
        await expect(
            linkEpiToRoleService.execute({ roleId: '1', caNumber: '11070', periodicityDays: 180 })
        ).rejects.toThrow('Cargo não encontrado.');
    });

    it('deve lançar erro quando vínculo já existe', async () => {
        roleRepositoryMock.findById.mockResolvedValue({ id: '1' });
        fetchEpiFromApiServiceMock.execute.mockResolvedValue({ id: '2' });
        roleEpiRepositoryMock.findByRoleAndEpi.mockResolvedValue({ id: '3' });

        await expect(
            linkEpiToRoleService.execute({ roleId: '1', caNumber: '11070', periodicityDays: 180 })
        ).rejects.toThrow('Este EPI já está vinculado a este Cargo.');
    });

    it('deve criar vínculo quando dados são válidos', async () => {
        roleRepositoryMock.findById.mockResolvedValue({ id: '1' });
        fetchEpiFromApiServiceMock.execute.mockResolvedValue({ id: '2' });
        roleEpiRepositoryMock.findByRoleAndEpi.mockResolvedValue(null);
        roleEpiRepositoryMock.create.mockResolvedValue({
            roleId: '1',
            epiId: '2',
            periodicityDays: 180
        });

        const resultado = await linkEpiToRoleService.execute({
            roleId: '1',
            caNumber: '11070',
            periodicityDays: 180
        });

        expect(resultado).toEqual({ roleId: '1', epiId: '2', periodicityDays: 180 });
        expect(roleEpiRepositoryMock.create).toHaveBeenCalledWith({
            roleId: '1',
            epiId: '2',
            periodicityDays: 180
        });
    });
});
