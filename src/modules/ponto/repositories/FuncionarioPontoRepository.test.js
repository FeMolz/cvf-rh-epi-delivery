import { jest } from '@jest/globals';

const prismaMock = {
    employee: {
        findMany: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const funcionarioPontoRepository = (await import('./FuncionarioPontoRepository.js')).default;

describe('FuncionarioPontoRepository', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve listar funcionários ativos com filtros opcionais', async () => {
        prismaMock.employee.findMany.mockResolvedValue([]);

        await funcionarioPontoRepository.listarAtivos({
            companyId: 'empresa-1',
            setorId: 'setor-1',
            roleId: 'cargo-1'
        });

        expect(prismaMock.employee.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    deletedAt: null,
                    status: 'ATIVO',
                    companyId: 'empresa-1',
                    setorId: 'setor-1',
                    roleId: 'cargo-1'
                }
            })
        );
    });
});
