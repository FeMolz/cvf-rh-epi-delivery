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
        userRepositoryMock.update.mockResolvedValue({
            id: '1',
            name: 'Novo Nome',
            isActive: true
        });

        const resultado = await updateUserService.execute(
            '1',
            { name: 'Novo Nome' },
            'ADMINISTRATIVO'
        );

        expect(resultado.name).toBe('Novo Nome');
        expect(userRepositoryMock.update).toHaveBeenCalledWith('1', { name: 'Novo Nome' });
        expect(resultado.isActive).toBeUndefined();
    });

    it('deve rejeitar tentativa de alterar isActive', async () => {
        await expect(
            updateUserService.execute('1', { isActive: false }, 'ADMIN')
        ).rejects.toMatchObject({
            message: 'O campo isActive não pode ser alterado manualmente pela API. Ele reflete presença online (login/logout).',
            statusCode: 400
        });
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

    it('deve impedir ADMINISTRATIVO de editar usuário ADMIN', async () => {
        userRepositoryMock.findById.mockResolvedValue({ id: '1', role: 'ADMIN' });

        await expect(
            updateUserService.execute('1', { name: 'Outro Nome' }, 'ADMINISTRATIVO')
        ).rejects.toMatchObject({
            message: 'Você não tem permissão para alterar este usuário.',
            statusCode: 403
        });
    });

    it('deve permitir ADMIN promover usuário para ADMIN', async () => {
        userRepositoryMock.findById.mockResolvedValue({ id: '1', role: 'COLABORADOR' });
        userRepositoryMock.update.mockResolvedValue({ id: '1', role: 'ADMIN' });

        const resultado = await updateUserService.execute('1', { role: 'ADMIN' }, 'ADMIN');

        expect(resultado.role).toBe('ADMIN');
    });

    it('deve permitir ADMINISTRATIVO promover usuário para ALMOXARIFADO', async () => {
        userRepositoryMock.findById.mockResolvedValue({ id: '1', role: 'COLABORADOR' });
        userRepositoryMock.update.mockResolvedValue({ id: '1', role: 'ALMOXARIFADO' });

        const resultado = await updateUserService.execute('1', { role: 'ALMOXARIFADO' }, 'ADMINISTRATIVO');

        expect(resultado.role).toBe('ALMOXARIFADO');
    });
});
