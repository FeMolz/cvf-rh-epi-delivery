import { jest } from '@jest/globals';

const roleRepositoryMock = {
    create: jest.fn(),
    findActiveByNameIgnoringCase: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleRepository.js', () => ({
    default: roleRepositoryMock
}));

const createRoleService = (await import('./CreateRoleService.js')).default;

describe('CreateRoleService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar cargo quando o nome nao existe', async () => {
        const roleData = { name: 'Eng De Minas', description: 'Engenharia de minas' };
        const createdRole = { id: 1, name: 'Eng De Minas', description: 'Engenharia de minas' };

        roleRepositoryMock.findActiveByNameIgnoringCase.mockResolvedValue(null);
        roleRepositoryMock.create.mockResolvedValue(createdRole);

        const result = await createRoleService.execute(roleData);

        expect(roleRepositoryMock.findActiveByNameIgnoringCase).toHaveBeenCalledWith('ENG DE MINAS');
        expect(roleRepositoryMock.create).toHaveBeenCalledWith('ENG DE MINAS', 'ENGENHARIA DE MINAS');
        expect(result).toEqual(createdRole);
    });

    it('deve normalizar espacos extras no nome antes de salvar', async () => {
        roleRepositoryMock.findActiveByNameIgnoringCase.mockResolvedValue(null);
        roleRepositoryMock.create.mockResolvedValue({ id: '1' });

        await createRoleService.execute({ name: '  Eng   de   Minas  ', description: 'Desc' });

        expect(roleRepositoryMock.findActiveByNameIgnoringCase).toHaveBeenCalledWith('ENG DE MINAS');
        expect(roleRepositoryMock.create).toHaveBeenCalledWith('ENG DE MINAS', 'DESC');
    });

    it('deve rejeitar cargo com nome duplicado ignorando maiusculas', async () => {
        roleRepositoryMock.findActiveByNameIgnoringCase.mockResolvedValue({
            id: '1',
            name: 'Eng de Minas'
        });

        await expect(
            createRoleService.execute({ name: 'Eng De Minas', description: 'Desc' })
        ).rejects.toMatchObject({
            message: 'Já existe um cargo ativo com este nome. Verifique a grafia e tente novamente.',
            statusCode: 400
        });

        expect(roleRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('deve rejeitar cargo sem nome', async () => {
        await expect(createRoleService.execute({ name: '   ', description: 'Desc' })).rejects.toMatchObject({
            message: 'O nome do cargo é obrigatório.',
            statusCode: 400
        });

        expect(roleRepositoryMock.findActiveByNameIgnoringCase).not.toHaveBeenCalled();
        expect(roleRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('deve preservar description nao textual ao criar', async () => {
        roleRepositoryMock.findActiveByNameIgnoringCase.mockResolvedValue(null);
        roleRepositoryMock.create.mockResolvedValue({ id: '1' });

        await createRoleService.execute({ name: 'Pedreiro', description: null });

        expect(roleRepositoryMock.create).toHaveBeenCalledWith('PEDREIRO', null);
    });
});
