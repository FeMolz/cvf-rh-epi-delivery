import { jest } from '@jest/globals';

const roleRepositoryMock = {
    findAll: jest.fn()
};

const planilhaCargoProviderMock = {
    gerarPlanilhaListaCargos: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleRepository.js', () => ({
    default: roleRepositoryMock
}));

jest.unstable_mockModule('../../../shared/providers/PlanilhaCargoProvider/PlanilhaCargoProvider.js', () => ({
    default: planilhaCargoProviderMock
}));

const exportarListaCargosPlanilhaService = (
    await import('./ExportarListaCargosPlanilhaService.js')
).default;

describe('ExportarListaCargosPlanilhaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve exportar cargos ativos', async () => {
        const cargos = [
            {
                name: 'Operador',
                description: 'Linha',
                deletedAt: null,
                createdAt: new Date('2024-01-01'),
                _count: { roleEpis: 2 }
            }
        ];

        roleRepositoryMock.findAll.mockResolvedValue(cargos);
        planilhaCargoProviderMock.gerarPlanilhaListaCargos.mockResolvedValue(Buffer.from('xlsx'));

        const resultado = await exportarListaCargosPlanilhaService.execute({ apenasInativos: false });

        expect(roleRepositoryMock.findAll).toHaveBeenCalledWith({
            apenasInativos: false,
            incluirInativos: false
        });
        expect(resultado.nomeArquivo).toMatch(/^cargos-ativos-/);
        expect(resultado.buffer).toBeInstanceOf(Buffer);
    });

    it('deve exportar cargos inativos', async () => {
        roleRepositoryMock.findAll.mockResolvedValue([]);
        planilhaCargoProviderMock.gerarPlanilhaListaCargos.mockResolvedValue(Buffer.from('xlsx'));

        const resultado = await exportarListaCargosPlanilhaService.execute({ apenasInativos: true });

        expect(roleRepositoryMock.findAll).toHaveBeenCalledWith({
            apenasInativos: true,
            incluirInativos: true
        });
        expect(resultado.nomeArquivo).toMatch(/^cargos-inativos-/);
    });
});
