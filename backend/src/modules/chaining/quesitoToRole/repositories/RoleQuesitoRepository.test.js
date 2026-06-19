import { jest } from '@jest/globals';

const prismaMock = {
    roleQuesito: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn()
    }
};

jest.unstable_mockModule('../../../../config/database.js', () => ({
    default: prismaMock
}));

const roleQuesitoRepository = (await import('./RoleQuesitoRepository.js')).default;

describe('RoleQuesitoRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve buscar vinculo por roleId e quesitoId', async () => {
        const vinculo = { id: '1', roleId: 'r', quesitoId: 'q' };
        prismaMock.roleQuesito.findUnique.mockResolvedValue(vinculo);

        const resultado = await roleQuesitoRepository.findByRoleIdAndQuesitoId('r', 'q');

        expect(prismaMock.roleQuesito.findUnique).toHaveBeenCalledWith({
            where: {
                roleId_quesitoId: {
                    roleId: 'r',
                    quesitoId: 'q'
                }
            }
        });
        expect(resultado).toEqual(vinculo);
    });

    it('deve criar vinculo com includes', async () => {
        const criado = { id: '1', roleId: 'r', quesitoId: 'q' };
        prismaMock.roleQuesito.create.mockResolvedValue(criado);

        const resultado = await roleQuesitoRepository.createLink('r', 'q');

        expect(prismaMock.roleQuesito.create).toHaveBeenCalledWith({
            data: { roleId: 'r', quesitoId: 'q' },
            include: { quesito: true, role: true }
        });
        expect(resultado).toEqual(criado);
    });

    it('deve remover vinculo', async () => {
        const removido = { id: '1' };
        prismaMock.roleQuesito.delete.mockResolvedValue(removido);

        const resultado = await roleQuesitoRepository.deleteByRoleIdAndQuesitoId('r', 'q');

        expect(prismaMock.roleQuesito.delete).toHaveBeenCalledWith({
            where: {
                roleId_quesitoId: {
                    roleId: 'r',
                    quesitoId: 'q'
                }
            }
        });
        expect(resultado).toEqual(removido);
    });

    it('deve listar vinculos por cargo com quesito', async () => {
        const lista = [{ id: '1', quesito: {} }];
        prismaMock.roleQuesito.findMany.mockResolvedValue(lista);

        const resultado = await roleQuesitoRepository.findManyByRoleIdWithQuesito('r');

        expect(prismaMock.roleQuesito.findMany).toHaveBeenCalledWith({
            where: { roleId: 'r' },
            include: { quesito: true },
            orderBy: { createdAt: 'asc' }
        });
        expect(resultado).toEqual(lista);
    });
});
