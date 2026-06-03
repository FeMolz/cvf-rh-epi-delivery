import { jest } from '@jest/globals';

const userRepositoryMock = {
    findById: jest.fn()
};

jest.unstable_mockModule('../repositories/UserRepository.js', () => ({
    default: userRepositoryMock
}));

const findUserByIdService = (await import('./FindUserByIdService.js')).default;

describe('FindUserByIdService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar o usuário quando encontrado', async () => {
        const usuario = { id: '1', name: 'Maria' };
        userRepositoryMock.findById.mockResolvedValue(usuario);

        const resultado = await findUserByIdService.execute('1');

        expect(resultado).toEqual(usuario);
        expect(userRepositoryMock.findById).toHaveBeenCalledWith('1');
    });

    it('deve lançar 404 quando o usuário não existir', async () => {
        userRepositoryMock.findById.mockResolvedValue(null);

        await expect(findUserByIdService.execute('inexistente')).rejects.toMatchObject({
            message: 'Usuário não encontrado.',
            statusCode: 404
        });
    });
});
