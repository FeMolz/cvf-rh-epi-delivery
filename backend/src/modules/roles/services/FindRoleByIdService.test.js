import { jest } from '@jest/globals';

const roleRepositoryMock = {
    findById: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleRepository.js', () => ({
    default: roleRepositoryMock
}));

const findRoleByIdService = (await import('./FindRoleByIdService.js')).default;

describe('FindRoleByIdService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar cargo quando encontrado', async () => {
        const cargo = { id: '1', name: 'Analista' };
        roleRepositoryMock.findById.mockResolvedValue(cargo);

        const resultado = await findRoleByIdService.execute('1');

        expect(resultado).toEqual(cargo);
    });

    it('deve lançar erro 404 quando cargo não existe', async () => {
        roleRepositoryMock.findById.mockResolvedValue(null);

        await expect(findRoleByIdService.execute('99')).rejects.toMatchObject({
            message: 'Cargo não encontrado',
            statusCode: 404
        });
    });
});
