import { jest } from '@jest/globals';

const roleEpiRepositoryMock = {
    findManyByRole: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleEpiRepository.js', () => ({
    default: roleEpiRepositoryMock
}));

const listEpisByRoleService = (await import('./ListEpisByRoleService.js')).default;

describe('ListEpisByRoleService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar EPIs vinculados ao cargo', async () => {
        const vinculos = [{ id: '1', epi: { caNumber: '11070' } }];
        roleEpiRepositoryMock.findManyByRole.mockResolvedValue(vinculos);

        const resultado = await listEpisByRoleService.execute('cargo-1');

        expect(roleEpiRepositoryMock.findManyByRole).toHaveBeenCalledWith('cargo-1');
        expect(resultado).toEqual(vinculos);
    });
});
