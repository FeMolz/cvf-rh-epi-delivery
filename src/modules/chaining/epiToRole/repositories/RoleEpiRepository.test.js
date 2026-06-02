import { jest } from '@jest/globals';

const prismaMock = {
    roleEpi: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn()
    }
};

jest.unstable_mockModule('../../../../config/database.js', () => ({
    default: prismaMock
}));

const roleEpiRepository = (await import('./RoleEpiRepository.js')).default;

describe('RoleEpiRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve buscar vinculo por cargo e epi', async () => {
        const vinculo = { id: '1', roleId: 'r1', epiId: 'e1' };
        prismaMock.roleEpi.findUnique.mockResolvedValue(vinculo);

        const resultado = await roleEpiRepository.findByRoleAndEpi('r1', 'e1');

        expect(prismaMock.roleEpi.findUnique).toHaveBeenCalledWith({
            where: { roleId_epiId: { roleId: 'r1', epiId: 'e1' } }
        });
        expect(resultado).toEqual(vinculo);
    });

    it('deve listar epis por cargo', async () => {
        prismaMock.roleEpi.findMany.mockResolvedValue([{ id: '1' }]);

        await roleEpiRepository.findManyByRole('r1');

        expect(prismaMock.roleEpi.findMany).toHaveBeenCalledWith({
            where: { roleId: 'r1' },
            include: { epi: true }
        });
    });

    it('deve criar vinculo cargo-epi', async () => {
        const dados = { roleId: 'r1', epiId: 'e1', periodicityDays: 180 };
        prismaMock.roleEpi.create.mockResolvedValue(dados);

        await roleEpiRepository.create(dados);

        expect(prismaMock.roleEpi.create).toHaveBeenCalledWith({
            data: dados,
            include: { epi: true, role: true }
        });
    });

    it('deve excluir vinculo por cargo e epi', async () => {
        await roleEpiRepository.deleteByRoleAndEpi('r1', 'e1');

        expect(prismaMock.roleEpi.delete).toHaveBeenCalledWith({
            where: { roleId_epiId: { roleId: 'r1', epiId: 'e1' } }
        });
    });
});
