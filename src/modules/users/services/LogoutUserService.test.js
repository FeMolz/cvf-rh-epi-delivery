import { jest } from '@jest/globals';

const userRepositoryMock = {
    findById: jest.fn(),
    marcarUsuarioOffline: jest.fn()
};

jest.unstable_mockModule('../repositories/UserRepository.js', () => ({
    default: userRepositoryMock
}));

jest.unstable_mockModule('../../../shared/utils/registrarEventoAuditoria.js', () => ({
    registrarEventoAuditoria: jest.fn(),
    TIPOS_EVENTO_AUDITORIA: { LOGOUT: 'LOGOUT' }
}));

const logoutUserService = (await import('./LogoutUserService.js')).default;

describe('LogoutUserService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve marcar usuário como offline', async () => {
        userRepositoryMock.findById.mockResolvedValue({ id: '1' });
        userRepositoryMock.marcarUsuarioOffline.mockResolvedValue({
            id: '1',
            isActive: false
        });

        const resultado = await logoutUserService.execute('1');

        expect(resultado.isActive).toBe(false);
        expect(userRepositoryMock.marcarUsuarioOffline).toHaveBeenCalledWith('1');
    });

    it('deve retornar 404 quando usuário não existir', async () => {
        userRepositoryMock.findById.mockResolvedValue(null);

        await expect(logoutUserService.execute('99')).rejects.toMatchObject({
            statusCode: 404
        });
    });
});
