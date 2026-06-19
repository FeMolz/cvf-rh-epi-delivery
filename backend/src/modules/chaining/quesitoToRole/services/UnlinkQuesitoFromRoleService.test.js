import { jest } from '@jest/globals';
import {
    MENSAGEM_ROLE_ID_QUESITO_ID_OBRIGATORIOS,
    MENSAGEM_VINCULO_QUESITO_CARGO_NAO_EXISTE
} from '../../../quesitos/constants/quesitoConstantes.js';

const roleQuesitoRepositoryMock = {
    findByRoleIdAndQuesitoId: jest.fn(),
    deleteByRoleIdAndQuesitoId: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleQuesitoRepository.js', () => ({
    default: roleQuesitoRepositoryMock
}));

const unlinkQuesitoFromRoleService = (await import('./UnlinkQuesitoFromRoleService.js')).default;

describe('UnlinkQuesitoFromRoleService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve rejeitar quando roleId ou quesitoId faltam', async () => {
        await expect(unlinkQuesitoFromRoleService.execute({ roleId: '1' })).rejects.toThrow(
            MENSAGEM_ROLE_ID_QUESITO_ID_OBRIGATORIOS
        );
    });

    it('deve rejeitar quando vinculo nao existe', async () => {
        roleQuesitoRepositoryMock.findByRoleIdAndQuesitoId.mockResolvedValue(null);

        await expect(
            unlinkQuesitoFromRoleService.execute({ roleId: '1', quesitoId: '2' })
        ).rejects.toThrow(MENSAGEM_VINCULO_QUESITO_CARGO_NAO_EXISTE);
    });

    it('deve remover quando vinculo existe', async () => {
        const removido = { id: 'v' };
        roleQuesitoRepositoryMock.findByRoleIdAndQuesitoId.mockResolvedValue({ id: 'v' });
        roleQuesitoRepositoryMock.deleteByRoleIdAndQuesitoId.mockResolvedValue(removido);

        const resultado = await unlinkQuesitoFromRoleService.execute({ roleId: '1', quesitoId: '2' });

        expect(roleQuesitoRepositoryMock.deleteByRoleIdAndQuesitoId).toHaveBeenCalledWith('1', '2');
        expect(resultado).toEqual(removido);
    });
});
