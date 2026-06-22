import { jest } from '@jest/globals';

const setorRepositoryMock = {
    findById: jest.fn()
};

jest.unstable_mockModule('../repositories/SetorRepository.js', () => ({
    default: setorRepositoryMock
}));

const validarSetorAtivoParaVinculoService = (
    await import('./ValidarSetorAtivoParaVinculoService.js')
).default;

describe('ValidarSetorAtivoParaVinculoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve aceitar setor ativo', async () => {
        setorRepositoryMock.findById.mockResolvedValue({ id: '1', isActive: true });

        await expect(validarSetorAtivoParaVinculoService.execute('1')).resolves.toBeUndefined();
    });

    it('deve rejeitar setor inexistente ou inativo', async () => {
        setorRepositoryMock.findById.mockResolvedValue({ id: '1', isActive: false });

        await expect(validarSetorAtivoParaVinculoService.execute('1')).rejects.toMatchObject({
            statusCode: 400
        });
    });
});
