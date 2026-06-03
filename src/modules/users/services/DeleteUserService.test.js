import { jest } from '@jest/globals';

const userRepositoryMock = {
    delete: jest.fn()
};

jest.unstable_mockModule('../repositories/UserRepository.js', () => ({
    default: userRepositoryMock
}));

const deleteUserService = (await import('./DeleteUserService.js')).default;

describe('DeleteUserService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve excluir o usuário pelo identificador', async () => {
        const usuarioExcluido = { id: '1', email: 'teste@teste.com' };
        userRepositoryMock.delete.mockResolvedValue(usuarioExcluido);

        const resultado = await deleteUserService.execute('1');

        expect(resultado).toEqual(usuarioExcluido);
        expect(userRepositoryMock.delete).toHaveBeenCalledWith('1');
    });
});
