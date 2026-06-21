import { jest } from '@jest/globals';

const companyRepositoryMock = {
    findById: jest.fn()
};

jest.unstable_mockModule('../repositories/CompanyRepository.js', () => ({
    default: companyRepositoryMock
}));

const validarEmpresaAtivaParaVinculoService = (await import('./ValidarEmpresaAtivaParaVinculoService.js')).default;

describe('ValidarEmpresaAtivaParaVinculoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve aceitar empresa ativa', async () => {
        companyRepositoryMock.findById.mockResolvedValue({ id: '1', isActive: true });

        await expect(validarEmpresaAtivaParaVinculoService.execute('1')).resolves.toBeUndefined();
    });

    it('deve rejeitar empresa inexistente ou inativa', async () => {
        companyRepositoryMock.findById.mockResolvedValue({ id: '1', isActive: false });

        await expect(validarEmpresaAtivaParaVinculoService.execute('1')).rejects.toMatchObject({
            statusCode: 400,
            message: 'Não é possível vincular funcionários a uma empresa inativa.'
        });
    });
});
