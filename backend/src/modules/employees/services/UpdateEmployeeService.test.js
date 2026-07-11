import { jest } from '@jest/globals';
import { statusFuncionarioEncerraVinculo } from '../../../shared/constants/funcionarioVinculoConstantes.js';

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

    it('deve rejeitar CPF duplicado na atualização', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'ATIVO',
            roleId: 'role-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([
            { id: '1', cpf: CPF_VALIDO, email: 'a@b.com' },
            { id: '2', cpf: '390.533.447-05', email: 'outro@b.com' }
        ]);

        await expect(
            updateEmployeeService.execute('1', { cpf: '390.533.447-05' })
        ).rejects.toMatchObject({ statusCode: 400, message: 'CPF já cadastrado no sistema' });
    });

    it('deve rejeitar e-mail duplicado na atualização', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'ATIVO',
            roleId: 'role-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([
            { id: '1', cpf: CPF_VALIDO, email: 'a@b.com' },
            { id: '2', cpf: '390.533.447-05', email: 'outro@b.com' }
        ]);

        await expect(
            updateEmployeeService.execute('1', { email: 'outro@b.com' })
        ).rejects.toMatchObject({ statusCode: 400, message: 'E-mail já cadastrado no sistema' });
    });

    it('deve atualizar e-mail e telefone válidos', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'ATIVO',
            roleId: 'role-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({
            id: '1',
            email: 'novo@b.com',
            telefone: TELEFONE_VALIDO
        });

        await updateEmployeeService.execute('1', {
            email: 'novo@b.com',
            telefone: TELEFONE_VALIDO
        });

        expect(employeeRepositoryMock.update).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({
                email: 'novo@b.com',
                telefone: TELEFONE_VALIDO
            })
        );
    });

    it('deve rejeitar data de nascimento inválida na atualização', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'ATIVO',
            roleId: 'role-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);

        await expect(
            updateEmployeeService.execute('1', { birthDate: 'data-invalida' })
        ).rejects.toMatchObject({ statusCode: 400, message: 'Data de nascimento inválida.' });
    });

    it('deve sincronizar periodicidade de EPI ao alterar status', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'ATIVO',
            roleId: 'role-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', status: 'FERIAS' });

        await updateEmployeeService.execute('1', {
            status: 'FERIAS',
            leaveReturnDate: '2099-12-31'
        });

        expect(gerenciarPeriodicidadeEpiFuncionarioServiceMock.sincronizarPorMudancaStatus).toHaveBeenCalledWith(
            'ATIVO',
            'FERIAS',
            '1'
        );
    });

    it('não deve validar cargo quando funcionário permanece desligado sem alterar cargo', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: new Date(),
            status: 'DESLIGADO',
            roleId: 'role-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', telefone: TELEFONE_VALIDO });

        await updateEmployeeService.execute('1', { telefone: TELEFONE_VALIDO });

        expect(validarCargoAtivoParaVinculoServiceMock.execute).not.toHaveBeenCalled();
    });

    it('deve resolver data de retorno ao alterar apenas leaveReturnDate', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'FERIAS',
            roleId: 'role-1',
            leaveReturnDate: new Date('2099-06-01')
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({
            id: '1',
            status: 'FERIAS',
            leaveReturnDate: new Date('2099-12-31')
        });

        await updateEmployeeService.execute('1', { leaveReturnDate: '2099-12-31' });

        expect(employeeRepositoryMock.update).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({ leaveReturnDate: expect.any(Date) })
        );
    });

    it('deve resolver afastamento existente sem alterar status nem data', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'FERIAS',
            roleId: 'role-1',
            leaveReturnDate: new Date('2099-06-01')
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', status: 'FERIAS' });

        await updateEmployeeService.execute('1', { name: 'Atualizado' });

        expect(employeeRepositoryMock.update).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({
                name: 'Atualizado',
                leaveReturnDate: expect.any(Date)
            })
        );
        expect(gerenciarPeriodicidadeEpiFuncionarioServiceMock.sincronizarPorMudancaStatus).not.toHaveBeenCalled();
    });

    it('deve validar cargo ao atualizar funcionário ativo sem alterar roleId', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'ATIVO',
            roleId: 'role-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', name: 'Novo' });

        await updateEmployeeService.execute('1', { name: 'Novo' });

        expect(validarCargoAtivoParaVinculoServiceMock.execute).toHaveBeenCalledWith('role-1');
    });

    it('deve validar cargo ao alterar roleId de funcionário desligado', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: new Date(),
            status: 'DESLIGADO',
            roleId: 'role-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', roleId: 'role-2' });

        await updateEmployeeService.execute('1', { roleId: 'role-2' });

        expect(validarCargoAtivoParaVinculoServiceMock.execute).toHaveBeenCalledWith('role-2');
    });

    it('deve atualizar CPF sem conflito com outros funcionários', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: 'ATIVO',
            roleId: 'role-1',
            cpf: CPF_VALIDO
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', cpf: '390.533.447-05' });

        await updateEmployeeService.execute('1', { cpf: '390.533.447-05' });

        expect(employeeRepositoryMock.update).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({ cpf: '390.533.447-05' })
        );
    });

    it('deve usar status vazio quando funcionário não possuir status definido', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: null,
            status: null,
            roleId: 'role-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', name: 'Sem Status' });

        await updateEmployeeService.execute('1', { name: 'Sem Status' });

        expect(employeeRepositoryMock.update).toHaveBeenCalledWith('1', { name: 'Sem Status' });
    });

    it('não deve alterar deletedAt ao trocar entre status de vínculo encerrado', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: '1',
            deletedAt: new Date('2024-01-01'),
            status: 'DESLIGADO',
            roleId: 'role-1'
        });
        employeeRepositoryMock.findAll.mockResolvedValue([{ id: '1', cpf: CPF_VALIDO, email: 'a@b.com' }]);
        employeeRepositoryMock.update.mockResolvedValue({ id: '1', status: 'RESCINDIDO' });

        await updateEmployeeService.execute('1', { status: 'RESCINDIDO' });

        expect(employeeRepositoryMock.update).toHaveBeenCalledWith(
            '1',
            expect.not.objectContaining({ deletedAt: expect.any(Date) })
        );
    });
});

describe('statusFuncionarioEncerraVinculo', () => {
    it('deve identificar status que encerram vínculo', () => {
        expect(statusFuncionarioEncerraVinculo('DESLIGADO')).toBe(true);
        expect(statusFuncionarioEncerraVinculo('RESCINDIDO')).toBe(true);
        expect(statusFuncionarioEncerraVinculo('APOSENTADO')).toBe(true);
    });

    it('deve retornar falso para status ativo ou ausente', () => {
        expect(statusFuncionarioEncerraVinculo('ATIVO')).toBe(false);
        expect(statusFuncionarioEncerraVinculo(null)).toBe(false);
        expect(statusFuncionarioEncerraVinculo(undefined)).toBe(false);
    });
});
