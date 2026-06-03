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

    it('deve retornar isActive para ADMIN', async () => {
        userRepositoryMock.findById.mockResolvedValue({
            id: '1',
            name: 'Maria',
            isActive: true
        });

        const resultado = await findUserByIdService.execute('1', 'ADMIN');

        expect(resultado.isActive).toBe(true);
    });

    it('deve ocultar isActive para não ADMIN', async () => {
        userRepositoryMock.findById.mockResolvedValue({
            id: '1',
            name: 'Maria',
            isActive: false
        });

        const resultado = await findUserByIdService.execute('1', 'ADMINISTRATIVO');

        expect(resultado.isActive).toBeUndefined();
    });

    it('deve lançar 404 quando o usuário não existir', async () => {
        userRepositoryMock.findById.mockResolvedValue(null);

        await expect(findUserByIdService.execute('inexistente', 'ADMIN')).rejects.toMatchObject({
            message: 'Usuário não encontrado.',
            statusCode: 404
        });
    });
});
