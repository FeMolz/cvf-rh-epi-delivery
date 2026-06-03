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

    it('deve retornar isActive na lista para ADMIN', async () => {
        userRepositoryMock.findAll.mockResolvedValue([
            { id: '1', name: 'A', isActive: true },
            { id: '2', name: 'B', isActive: false }
        ]);

        const resultado = await listUsersService.execute('ADMIN');

        expect(resultado[0].isActive).toBe(true);
        expect(resultado[1].isActive).toBe(false);
    });

    it('deve ocultar isActive para visualizador não ADMIN', async () => {
        userRepositoryMock.findAll.mockResolvedValue([{ id: '1', name: 'A', isActive: true }]);

        const resultado = await listUsersService.execute('ADMINISTRATIVO');

        expect(resultado[0].isActive).toBeUndefined();
        expect(resultado[0].name).toBe('A');
    });
});
