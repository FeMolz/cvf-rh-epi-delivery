import { jest } from '@jest/globals';

const roleQuesitoRepositoryMock = {
    findManyByRoleIdWithQuesito: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleQuesitoRepository.js', () => ({
    default: roleQuesitoRepositoryMock
}));

const listQuesitosVinculadosAoCargoService = (await import('./ListQuesitosVinculadosAoCargoService.js')).default;

describe('ListQuesitosVinculadosAoCargoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve delegar listagem ao repositorio', async () => {
        const lista = [{ id: '1' }];
        roleQuesitoRepositoryMock.findManyByRoleIdWithQuesito.mockResolvedValue(lista);

        const resultado = await listQuesitosVinculadosAoCargoService.execute('role-1');

        expect(roleQuesitoRepositoryMock.findManyByRoleIdWithQuesito).toHaveBeenCalledWith('role-1');
        expect(resultado).toEqual(lista);
    });
});
