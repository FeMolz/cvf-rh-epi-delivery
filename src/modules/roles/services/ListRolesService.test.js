import { jest } from '@jest/globals';

const roleRepositoryMock = {
    findAll: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleRepository.js', () => ({
    default: roleRepositoryMock
}));

const listRolesService = (await import('./ListRolesService.js')).default;

describe('ListRolesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar lista de cargos do repositorio', async () => {
        const listaCargos = [
            { id: '1', name: 'Analista', description: 'Desc' },
            { id: '2', name: 'Gerente', description: 'Desc 2' }
        ];
        roleRepositoryMock.findAll.mockResolvedValue(listaCargos);

        const resultado = await listRolesService.execute();

        expect(roleRepositoryMock.findAll).toHaveBeenCalled();
        expect(resultado).toEqual(listaCargos);
    });

    it('deve retornar lista vazia quando nao ha cargos', async () => {
        roleRepositoryMock.findAll.mockResolvedValue([]);

        const resultado = await listRolesService.execute();

        expect(resultado).toEqual([]);
    });
});
