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
            { id: '1', name: 'A', role: 'ADMINISTRATIVO', isActive: true },
            { id: '2', name: 'B', role: 'COLABORADOR', isActive: false }
        ]);

        const resultado = await listUsersService.execute('ADMIN');

        expect(resultado[0].isActive).toBe(true);
        expect(resultado[1].isActive).toBe(false);
    });

    it('deve ocultar isActive para visualizador não ADMIN', async () => {
        userRepositoryMock.findAll.mockResolvedValue([
            { id: '1', name: 'A', role: 'COLABORADOR', isActive: true }
        ]);

        const resultado = await listUsersService.execute('ADMINISTRATIVO');

        expect(resultado[0].isActive).toBeUndefined();
        expect(resultado[0].name).toBe('A');
    });

    it('deve ocultar usuários com papel superior ao visualizador', async () => {
        userRepositoryMock.findAll.mockResolvedValue([
            { id: '1', name: 'Admin', role: 'ADMIN' },
            { id: '2', name: 'Colab', role: 'COLABORADOR' }
        ]);

        const resultado = await listUsersService.execute('ADMINISTRATIVO');

        expect(resultado).toHaveLength(1);
        expect(resultado[0].role).toBe('COLABORADOR');
    });
});
