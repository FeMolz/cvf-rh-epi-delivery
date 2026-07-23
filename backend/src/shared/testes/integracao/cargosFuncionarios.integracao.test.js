import prisma from '../../../config/database.js';
import createEmployeeService from '../../../modules/employees/services/CreateEmployeeService.js';
import createRoleService from '../../../modules/roles/services/CreateRoleService.js';
import deleteRoleService from '../../../modules/roles/services/DeleteRoleService.js';
import { criarEmpresaIntegracao, criarSetorIntegracao } from './utilitarios/fabricaEmpresa.js';
import { gerarCpfIntegracao } from './utilitarios/gerarCpfIntegracao.js';
import { exigirIntegracaoHabilitada, verificarConexaoBancoIntegracao } from './utilitariosBancoIntegracao.js';
import { limparCargoComDependencias, limparEmpresa, limparFuncionarios, limparSetor } from './utilitarios/limpeza.js';

describe('Integração — cargos e funcionários', () => {
    const sufixo = `${Date.now()}`;
    /** @type {string | null} */
    let empresaId = null;
    /** @type {string | null} */
    let setorId = null;
    /** @type {string | null} */
    let cargoId = null;
    /** @type {string | null} */
    let funcionarioId = null;

    beforeAll(async () => {
        exigirIntegracaoHabilitada();
        await verificarConexaoBancoIntegracao();
        const empresa = await criarEmpresaIntegracao(sufixo);
        const setor = await criarSetorIntegracao(sufixo);
        empresaId = empresa.id;
        setorId = setor.id;
    });

    afterAll(async () => {
        if (funcionarioId) {
            await limparFuncionarios([funcionarioId]);
        }
        if (cargoId) {
            await limparCargoComDependencias(cargoId);
        }
        if (setorId) {
            await limparSetor(setorId);
        }
        if (empresaId) {
            await limparEmpresa(empresaId);
        }
        await prisma.$disconnect();
    });

    it('deve criar cargo e funcionário vinculados', async () => {
        const cargo = await createRoleService.execute({
            name: `Cargo Funcionário ${sufixo}`,
            description: 'Integração'
        });
        cargoId = cargo.id;

        const cpf = gerarCpfIntegracao(`${sufixo}-funcionario`);
        const funcionario = await createEmployeeService.execute({
            name: `Funcionário Service ${sufixo}`,
            cpf,
            email: `func-service-${sufixo}@integracao.test`,
            telefone: '(11) 98888-7777',
            birthDate: '1990-01-15',
            companyId: empresaId,
            roleId: cargoId,
            setorId
        });

        funcionarioId = funcionario.id;

        expect(funcionario.name).toContain('Funcionário Service');
        expect(funcionario.roleId).toBe(cargoId);
    });

    it('deve impedir exclusão de cargo com funcionários vinculados', async () => {
        await expect(deleteRoleService.execute(cargoId)).rejects.toThrow(
            'Não é possível excluir este cargo enquanto houver funcionários cadastrados nele.'
        );
    });
});
