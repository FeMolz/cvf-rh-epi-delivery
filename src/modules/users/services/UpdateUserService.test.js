import { jest } from '@jest/globals';

const userRepositoryMock = {
    findById: jest.fn(),
    update: jest.fn()
};

jest.unstable_mockModule('../repositories/UserRepository.js', () => ({
    default: userRepositoryMock
}));

const updateUserService = (await import('./UpdateUserService.js')).default;

describe('UpdateUserService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve atualizar o usuário quando existir', async () => {
        userRepositoryMock.findById.mockResolvedValue({ id: '1', role: 'COLABORADOR' });
        userRepositoryMock.update.mockResolvedValue({ id: '1', name: 'Novo Nome' });

        const resultado = await updateUserService.execute(
            '1',
            { name: 'Novo Nome' },
            'ADMINISTRATIVO'
        );

        expect(resultado.name).toBe('Novo Nome');
        expect(userRepositoryMock.update).toHaveBeenCalledWith('1', { name: 'Novo Nome' });
    });

    it('deve lançar 404 quando o usuário não existir', async () => {
        userRepositoryMock.findById.mockResolvedValue(null);

        await expect(
            updateUserService.execute('1', { name: 'Teste' }, 'ADMIN')
        ).rejects.toMatchObject({
            message: 'Usuário não encontrado.',
            statusCode: 404
        });
    });

    it('deve impedir definir papel ADMIN sem solicitante ADMIN', async () => {
        userRepositoryMock.findById.mockResolvedValue({ id: '1', role: 'COLABORADOR' });

        await expect(
            updateUserService.execute('1', { role: 'ADMIN' }, 'ADMINISTRATIVO')
        ).rejects.toMatchObject({
            message: 'Não é permitido definir o papel ADMIN.',
            statusCode: 403
        });
    });

    it('deve permitir ADMIN promover usuário para ADMIN', async () => {
        userRepositoryMock.findById.mockResolvedValue({ id: '1', role: 'COLABORADOR' });
        userRepositoryMock.update.mockResolvedValue({ id: '1', role: 'ADMIN' });

        const resultado = await updateUserService.execute('1', { role: 'ADMIN' }, 'ADMIN');

        expect(resultado.role).toBe('ADMIN');
    });
});
