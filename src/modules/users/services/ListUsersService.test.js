import { jest } from '@jest/globals';

const userRepositoryMock = {
    findAll: jest.fn()
};

jest.unstable_mockModule('../repositories/UserRepository.js', () => ({
    default: userRepositoryMock
}));

const listUsersService = (await import('./ListUsersService.js')).default;

describe('ListUsersService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar a lista de usuários do repositório', async () => {
        const usuarios = [{ id: '1' }, { id: '2' }];
        userRepositoryMock.findAll.mockResolvedValue(usuarios);

        const resultado = await listUsersService.execute();

        expect(resultado).toEqual(usuarios);
        expect(userRepositoryMock.findAll).toHaveBeenCalledTimes(1);
    });
});
