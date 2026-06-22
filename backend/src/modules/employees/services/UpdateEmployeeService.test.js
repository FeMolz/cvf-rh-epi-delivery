import { jest } from '@jest/globals';

const employeeRepositoryMock = {
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn()
};

jest.unstable_mockModule('../repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

const gerenciarPeriodicidadeEpiFuncionarioServiceMock = {
    sincronizarPorMudancaStatus: jest.fn()
};

jest.unstable_mockModule('../../epiDeliveries/services/GerenciarPeriodicidadeEpiFuncionarioService.js', () => ({
    default: gerenciarPeriodicidadeEpiFuncionarioServiceMock
}));

const validarCargoAtivoParaVinculoServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../../roles/services/ValidarCargoAtivoParaVinculoService.js', () => ({
    default: validarCargoAtivoParaVinculoServiceMock
}));

const validarEmpresaAtivaParaVinculoServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../../companies/services/ValidarEmpresaAtivaParaVinculoService.js', () => ({
    default: validarEmpresaAtivaParaVinculoServiceMock
}));

const validarSetorAtivoParaVinculoServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../../setores/services/ValidarSetorAtivoParaVinculoService.js', () => ({
    default: validarSetorAtivoParaVinculoServiceMock
}));

const updateEmployeeService = (await import('./UpdateEmployeeService.js')).default;

const CPF_VALIDO = '529.982.247-25';
const TELEFONE_VALIDO = '(11) 98888-7777';

describe('UpdateEmployeeService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    beforeEach(() => {
        validarEmpresaAtivaParaVinculoServiceMock.execute.mockResolvedValue(undefined);
        validarCargoAtivoParaVinculoServiceMock.execute.mockResolvedValue(undefined);
        validarSetorAtivoParaVinculoServiceMock.execute.mockResolvedValue(undefined);
    });

    it('deve atualizar funcionário com dados válidos', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'ATIVO',
            roleId: 'role-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', telefone: TELEFONE_VALIDO });

        const resultado = await updateEmployeeService.execute('1', { telefone: TELEFONE_VALIDO });

        expect(validarCargoAtivoParaVinculoServiceMock.execute).toHaveBeenCalledWith('role-1');
        expect(employeeRepositoryMock.update).toHaveBeenCalledWith('1', { telefone: TELEFONE_VALIDO });
        expect(resultado).toEqual({ id: '1', telefone: TELEFONE_VALIDO });
    });

    it('deve retornar NOT_FOUND quando funcionário não existe', async () => {
        employeeRepositoryMock.findById.mockResolvedValue(null);

        await expect(updateEmployeeService.execute('99', { name: 'Teste' })).rejects.toMatchObject({
            statusCode: 404
        });
    });

    it('deve rejeitar CPF inválido na atualização', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'DESLIGADO',
            roleId: 'role-1'
        });

        await expect(updateEmployeeService.execute('1', { cpf: '123' })).rejects.toThrow(
            'CPF inválido. Use o formato xxx.xxx.xxx-xx (11 dígitos com pontos e hífen).'
        );
    });

    it('deve preencher deletedAt ao desligar funcionário', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'ATIVO',
            roleId: 'role-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', status: 'DESLIGADO' });

        await updateEmployeeService.execute('1', { status: 'DESLIGADO' });

        expect(employeeRepositoryMock.update).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({
                status: 'DESLIGADO',
                deletedAt: expect.any(Date)
            })
        );
    });

    it('deve limpar deletedAt e validar cargo ao readmitir funcionário', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: new Date(),
            status: 'DESLIGADO',
            roleId: 'role-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', status: 'ATIVO', deletedAt: null });

        await updateEmployeeService.execute('1', { status: 'ATIVO', roleId: 'role-2' });

        expect(validarCargoAtivoParaVinculoServiceMock.execute).toHaveBeenCalledWith('role-2');
        expect(employeeRepositoryMock.update).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({
                status: 'ATIVO',
                roleId: 'role-2',
                deletedAt: null
            })
        );
    });

    it('deve validar empresa ativa ao alterar companyId', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'ATIVO',
            roleId: 'role-1',
            companyId: 'empresa-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', companyId: 'empresa-2' });

        await updateEmployeeService.execute('1', { companyId: 'empresa-2' });

        expect(validarEmpresaAtivaParaVinculoServiceMock.execute).toHaveBeenCalledWith('empresa-2');
    });

    it('deve validar setor ativo ao alterar setorId', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'ATIVO',
            roleId: 'role-1',
            setorId: 'setor-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', setorId: 'setor-2' });

        await updateEmployeeService.execute('1', { setorId: 'setor-2' });

        expect(validarSetorAtivoParaVinculoServiceMock.execute).toHaveBeenCalledWith('setor-2');
    });

    it('deve converter datas string antes de atualizar', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'ATIVO',
            roleId: 'role-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', status: 'FERIAS' });

        await updateEmployeeService.execute('1', {
            birthDate: '1995-08-12',
            admissionDate: '2026-05-10',
            status: 'FERIAS',
            leaveReturnDate: '2099-12-31'
        });

        expect(employeeRepositoryMock.update).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({
                birthDate: expect.any(Date),
                admissionDate: expect.any(Date),
                status: 'FERIAS',
                leaveReturnDate: expect.any(Date)
            })
        );
    });
});
