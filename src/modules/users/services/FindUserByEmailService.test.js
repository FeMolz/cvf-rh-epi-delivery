import { jest } from '@jest/globals';

const userRepositoryMock = {
    findByEmail: jest.fn()
};

jest.unstable_mockModule('../repositories/UserRepository.js', () => ({
    default: userRepositoryMock
}));

const findUserByEmailService = (await import('./FindUserByEmailService.js')).default;

describe('FindUserByEmailService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar o usuário sem o hash da senha', async () => {
        userRepositoryMock.findByEmail.mockResolvedValue({
            id: '1',
            email: 'maria@teste.com',
            isActive: true,
            passwordHash: 'hash-secreto'
        });

        const resultado = await findUserByEmailService.execute('maria@teste.com', 'ADMIN');

        expect(resultado).toEqual({
            id: '1',
            email: 'maria@teste.com',
            isActive: true
        });
        expect(resultado.passwordHash).toBeUndefined();
    });

    it('deve lançar 404 quando o e-mail não existir', async () => {
        userRepositoryMock.findByEmail.mockResolvedValue(null);

        await expect(findUserByEmailService.execute('ausente@teste.com')).rejects.toMatchObject({
            message: 'Usuário não encontrado.',
            statusCode: 404
        });
    });
});
