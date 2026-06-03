import { jest } from '@jest/globals';

const deleteUserServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('./DeleteUserService.js', () => ({
    default: deleteUserServiceMock
}));

const deleteMeService = (await import('./DeleteMeService.js')).default;

describe('DeleteMeService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve excluir a conta autenticada e retornar mensagem de sucesso', async () => {
        deleteUserServiceMock.execute.mockResolvedValue({ id: '1' });

        const resultado = await deleteMeService.execute('1');

        expect(deleteUserServiceMock.execute).toHaveBeenCalledWith('1');
        expect(resultado).toEqual({
            message: 'Sua conta foi excluída com sucesso.'
        });
    });
});
