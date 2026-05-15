import { jest } from '@jest/globals';

const roleRepositoryMock = {
    findById: jest.fn()
};

const quesitoRepositoryMock = {
    findById: jest.fn()
};

const roleQuesitoRepositoryMock = {
    findByRoleIdAndQuesitoId: jest.fn(),
    createLink: jest.fn()
};

jest.unstable_mockModule('../../../roles/repositories/RoleRepository.js', () => ({
    default: roleRepositoryMock
}));

jest.unstable_mockModule('../../../quesitos/repositories/QuesitoRepository.js', () => ({
    default: quesitoRepositoryMock
}));

jest.unstable_mockModule('../repositories/RoleQuesitoRepository.js', () => ({
    default: roleQuesitoRepositoryMock
}));

const linkQuesitoToRoleService = (await import('./LinkQuesitoToRoleService.js')).default;

describe('LinkQuesitoToRoleService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve rejeitar quando roleId ou quesitoId faltam', async () => {
        await expect(linkQuesitoToRoleService.execute({ roleId: '1' })).rejects.toThrow(
            'roleId e quesitoId sao obrigatorios.'
        );
    });

    it('deve rejeitar quando cargo nao existe', async () => {
        roleRepositoryMock.findById.mockResolvedValue(null);

        await expect(
            linkQuesitoToRoleService.execute({ roleId: '1', quesitoId: '2' })
        ).rejects.toThrow('Cargo nao encontrado.');
    });

    it('deve rejeitar quando quesito nao existe', async () => {
        roleRepositoryMock.findById.mockResolvedValue({ id: '1' });
        quesitoRepositoryMock.findById.mockResolvedValue(null);

        await expect(
            linkQuesitoToRoleService.execute({ roleId: '1', quesitoId: '2' })
        ).rejects.toThrow('Quesito nao encontrado.');
    });

    it('deve rejeitar quando vinculo ja existe', async () => {
        roleRepositoryMock.findById.mockResolvedValue({ id: '1' });
        quesitoRepositoryMock.findById.mockResolvedValue({ id: '2' });
        roleQuesitoRepositoryMock.findByRoleIdAndQuesitoId.mockResolvedValue({ id: 'v' });

        await expect(
            linkQuesitoToRoleService.execute({ roleId: '1', quesitoId: '2' })
        ).rejects.toThrow('Este quesito ja esta vinculado a este cargo.');
    });

    it('deve criar vinculo quando dados sao validos', async () => {
        const criado = { roleId: '1', quesitoId: '2' };
        roleRepositoryMock.findById.mockResolvedValue({ id: '1' });
        quesitoRepositoryMock.findById.mockResolvedValue({ id: '2' });
        roleQuesitoRepositoryMock.findByRoleIdAndQuesitoId.mockResolvedValue(null);
        roleQuesitoRepositoryMock.createLink.mockResolvedValue(criado);

        const resultado = await linkQuesitoToRoleService.execute({ roleId: '1', quesitoId: '2' });

        expect(roleQuesitoRepositoryMock.createLink).toHaveBeenCalledWith('1', '2');
        expect(resultado).toEqual(criado);
    });
});
