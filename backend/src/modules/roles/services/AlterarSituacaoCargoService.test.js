import { jest } from '@jest/globals';

const roleRepositoryMock = {
    findById: jest.fn(),
    countEmployeesByRoleId: jest.fn(),
    softDelete: jest.fn(),
    reactivate: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleRepository.js', () => ({
    default: roleRepositoryMock
}));

const alterarSituacaoCargoService = (await import('./AlterarSituacaoCargoService.js')).default;

describe('AlterarSituacaoCargoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve desativar cargo sem funcionários vinculados', async () => {
        const cargoDesativado = { id: '1', name: 'Operador', deletedAt: new Date() };
        roleRepositoryMock.findById.mockResolvedValue({ id: '1', name: 'Operador', deletedAt: null });
        roleRepositoryMock.countEmployeesByRoleId.mockResolvedValue(0);
        roleRepositoryMock.softDelete.mockResolvedValue(cargoDesativado);

        const resultado = await alterarSituacaoCargoService.execute('1', { ativo: false });

        expect(roleRepositoryMock.softDelete).toHaveBeenCalledWith('1');
        expect(resultado).toEqual(cargoDesativado);
    });

    it('deve reativar cargo inativo', async () => {
        const cargoReativado = { id: '1', name: 'Operador', deletedAt: null };
        roleRepositoryMock.findById.mockResolvedValue({ id: '1', deletedAt: new Date() });
        roleRepositoryMock.reactivate.mockResolvedValue(cargoReativado);

        const resultado = await alterarSituacaoCargoService.execute('1', { ativo: true });

        expect(roleRepositoryMock.reactivate).toHaveBeenCalledWith('1');
        expect(resultado).toEqual(cargoReativado);
    });

    it('deve bloquear desativação com funcionários cadastrados no cargo', async () => {
        roleRepositoryMock.findById.mockResolvedValue({ id: '1', deletedAt: null });
        roleRepositoryMock.countEmployeesByRoleId.mockResolvedValue(1);

        await expect(alterarSituacaoCargoService.execute('1', { ativo: false })).rejects.toMatchObject({
            statusCode: 409
        });
        expect(roleRepositoryMock.softDelete).not.toHaveBeenCalled();
    });

    it('deve retornar cargo quando situação já é a desejada', async () => {
        const cargo = { id: '1', deletedAt: null };
        roleRepositoryMock.findById.mockResolvedValue(cargo);

        const resultado = await alterarSituacaoCargoService.execute('1', { ativo: true });

        expect(resultado).toEqual(cargo);
        expect(roleRepositoryMock.reactivate).not.toHaveBeenCalled();
    });

    it('deve retornar cargo inativo quando já está desativado', async () => {
        const cargo = { id: '1', deletedAt: new Date() };
        roleRepositoryMock.findById.mockResolvedValue(cargo);

        const resultado = await alterarSituacaoCargoService.execute('1', { ativo: false });

        expect(resultado).toEqual(cargo);
        expect(roleRepositoryMock.softDelete).not.toHaveBeenCalled();
    });

    it('deve lançar erro 404 quando cargo não existe', async () => {
        roleRepositoryMock.findById.mockResolvedValue(null);

        await expect(alterarSituacaoCargoService.execute('99', { ativo: true })).rejects.toMatchObject({
            statusCode: 404
        });
    });
});
