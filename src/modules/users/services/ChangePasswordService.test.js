import { jest } from '@jest/globals';

const userRepositoryMock = {
    findById: jest.fn(),
    changePassword: jest.fn()
};

const bcryptMock = {
    hash: jest.fn()
};

jest.unstable_mockModule('../repositories/UserRepository.js', () => ({
    default: userRepositoryMock
}));

jest.unstable_mockModule('bcryptjs', () => ({
    default: bcryptMock
}));

const changePasswordService = (await import('./ChangePasswordService.js')).default;

describe('ChangePasswordService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve permitir usuário alterar a própria senha', async () => {
        userRepositoryMock.findById.mockResolvedValue({ id: '1' });
        bcryptMock.hash.mockResolvedValue('hash');
        userRepositoryMock.changePassword.mockResolvedValue({ id: '1' });

        await changePasswordService.execute({
            identificadorUsuarioAlvo: '1',
            novaSenha: 'nova123',
            identificadorUsuarioAutenticado: '1',
            papelUsuarioAutenticado: 'COLABORADOR'
        });

        expect(userRepositoryMock.changePassword).toHaveBeenCalledWith('1', 'hash');
    });

    it('deve impedir alteração de senha de outro usuário sem ser ADMIN', async () => {
        await expect(
            changePasswordService.execute({
                identificadorUsuarioAlvo: '2',
                novaSenha: 'nova123',
                identificadorUsuarioAutenticado: '1',
                papelUsuarioAutenticado: 'COLABORADOR'
            })
        ).rejects.toMatchObject({
            message: 'Você não tem permissão para alterar a senha deste usuário.',
            statusCode: 403
        });
    });

    it('deve exigir nova senha informada', async () => {
        await expect(
            changePasswordService.execute({
                identificadorUsuarioAlvo: '1',
                novaSenha: '   ',
                identificadorUsuarioAutenticado: '1',
                papelUsuarioAutenticado: 'COLABORADOR'
            })
        ).rejects.toMatchObject({
            message: 'Nova senha não informada.',
            statusCode: 400
        });
    });

    it('deve lançar 404 quando usuário alvo não existir', async () => {
        userRepositoryMock.findById.mockResolvedValue(null);

        await expect(
            changePasswordService.execute({
                identificadorUsuarioAlvo: '99',
                novaSenha: 'nova123',
                identificadorUsuarioAutenticado: '1',
                papelUsuarioAutenticado: 'ADMIN'
            })
        ).rejects.toMatchObject({
            message: 'Usuário não encontrado.',
            statusCode: 404
        });
    });

    it('deve permitir ADMIN alterar senha de qualquer usuário', async () => {
        userRepositoryMock.findById.mockResolvedValue({ id: '2' });
        bcryptMock.hash.mockResolvedValue('hash');

        await changePasswordService.execute({
            identificadorUsuarioAlvo: '2',
            novaSenha: 'nova123',
            identificadorUsuarioAutenticado: '1',
            papelUsuarioAutenticado: 'ADMIN'
        });

        expect(userRepositoryMock.changePassword).toHaveBeenCalled();
    });
});
