import { jest } from '@jest/globals';

const roleRepositoryMock = {
    findById: jest.fn()
};

jest.unstable_mockModule('../repositories/RoleRepository.js', () => ({
    default: roleRepositoryMock
}));

const validarCargoAtivoParaVinculoService = (await import('./ValidarCargoAtivoParaVinculoService.js')).default;

describe('ValidarCargoAtivoParaVinculoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve aceitar cargo ativo', async () => {
        roleRepositoryMock.findById.mockResolvedValue({ id: '1', deletedAt: null });

        await expect(validarCargoAtivoParaVinculoService.execute('1')).resolves.toBeUndefined();
    });

    it('deve rejeitar cargo inexistente ou inativo', async () => {
        roleRepositoryMock.findById.mockResolvedValue({ id: '1', deletedAt: new Date() });

        await expect(validarCargoAtivoParaVinculoService.execute('1')).rejects.toMatchObject({
            statusCode: 400
        });
    });
});
