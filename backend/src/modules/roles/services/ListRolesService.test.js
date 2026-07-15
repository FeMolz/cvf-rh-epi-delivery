import { jest } from '@jest/globals';

const roleRepositoryMock = {
    findAll: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleRepository.js', () => ({
    default: roleRepositoryMock
}));

const listRolesService = (await import('./ListRolesService.js')).default;

describe('ListRolesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar lista de cargos ativos por padrao', async () => {
        const listaCargos = [
            { id: '1', name: 'Analista', description: 'Desc' },
            { id: '2', name: 'Gerente', description: 'Desc 2' }
        ];
        roleRepositoryMock.findAll.mockResolvedValue(listaCargos);

        const resultado = await listRolesService.execute({ papelUsuario: 'ADMINISTRATIVO' });

        expect(roleRepositoryMock.findAll).toHaveBeenCalledWith({
            incluirInativos: false,
            apenasInativos: false
        });
        expect(resultado).toEqual(listaCargos);
    });

    it('deve listar cargos inativos para ADMIN', async () => {
        roleRepositoryMock.findAll.mockResolvedValue([]);

        await listRolesService.execute({ incluirInativos: true, papelUsuario: 'ADMIN' });

        expect(roleRepositoryMock.findAll).toHaveBeenCalledWith({
            incluirInativos: true,
            apenasInativos: false
        });
    });

    it('deve listar apenas cargos inativos', async () => {
        roleRepositoryMock.findAll.mockResolvedValue([]);

        await listRolesService.execute({ apenasInativos: true, papelUsuario: 'ADMINISTRATIVO' });

        expect(roleRepositoryMock.findAll).toHaveBeenCalledWith({
            incluirInativos: false,
            apenasInativos: true
        });
    });

    it('deve listar cargos ativos e inativos para ADMINISTRATIVO', async () => {
        roleRepositoryMock.findAll.mockResolvedValue([]);

        await listRolesService.execute({ incluirInativos: true, papelUsuario: 'ADMINISTRATIVO' });

        expect(roleRepositoryMock.findAll).toHaveBeenCalledWith({
            incluirInativos: true,
            apenasInativos: false
        });
    });

    it('deve rejeitar listagem de inativos para ALMOXARIFADO', async () => {
        await expect(
            listRolesService.execute({ incluirInativos: true, papelUsuario: 'ALMOXARIFADO' })
        ).rejects.toMatchObject({
            statusCode: 403
        });
    });

    it('deve rejeitar listagem apenas inativos para perfil sem gestão', async () => {
        await expect(
            listRolesService.execute({ apenasInativos: true, papelUsuario: 'ALMOXARIFADO' })
        ).rejects.toMatchObject({
            statusCode: 403
        });
    });

    it('deve listar cargos ativos quando execute é chamado sem opções', async () => {
        roleRepositoryMock.findAll.mockResolvedValue([]);

        await listRolesService.execute();

        expect(roleRepositoryMock.findAll).toHaveBeenCalledWith({
            incluirInativos: false,
            apenasInativos: false
        });
    });
});
