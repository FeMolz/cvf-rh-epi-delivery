import prisma from '../../../config/database.js';
import createCompanyService from '../../../modules/companies/services/CreateCompanyService.js';
import deleteCompanyService from '../../../modules/companies/services/DeleteCompanyService.js';
import createSetorService from '../../../modules/setores/services/CreateSetorService.js';
import validarEmpresaAtivaParaVinculoService from '../../../modules/companies/services/ValidarEmpresaAtivaParaVinculoService.js';
import validarSetorAtivoParaVinculoService from '../../../modules/setores/services/ValidarSetorAtivoParaVinculoService.js';
import { criarCargoIntegracao } from './utilitarios/fabricaCargo.js';
import { criarFuncionarioIntegracao } from './utilitarios/fabricaFuncionario.js';
import { exigirIntegracaoHabilitada, verificarConexaoBancoIntegracao } from './utilitariosBancoIntegracao.js';
import { limparEmpresa, limparFuncionarios, limparSetor } from './utilitarios/limpeza.js';

describe('Integração — empresas e setores', () => {
    const sufixo = `${Date.now()}`;
    /** @type {string | null} */
    let empresaId = null;
    /** @type {string | null} */
    let setorId = null;
    /** @type {string | null} */
    let funcionarioId = null;
    /** @type {string | null} */
    let cargoBloqueioId = null;

    beforeAll(async () => {
        exigirIntegracaoHabilitada();
        await verificarConexaoBancoIntegracao();
    });

    afterAll(async () => {
        if (funcionarioId) {
            await limparFuncionarios([funcionarioId]);
        }
        if (cargoBloqueioId) {
            await prisma.role.delete({ where: { id: cargoBloqueioId } });
        }
        if (setorId) {
            await limparSetor(setorId);
        }
        if (empresaId) {
            await limparEmpresa(empresaId);
        }
        await prisma.$disconnect();
    });

    it('deve criar empresa e setor via services', async () => {
        const empresa = await createCompanyService.execute({
            name: `Empresa Integração ${sufixo}`,
            cnpj: `${sufixo.slice(-14).padStart(14, '0')}`
        });
        const setor = await createSetorService.execute({
            nome: `Setor Integração ${sufixo}`
        });

        empresaId = empresa.id;
        setorId = setor.id;

        expect(empresa.name).toContain('Empresa Integração');
        expect(setor.nome).toContain('Setor Integração');
        await expect(validarEmpresaAtivaParaVinculoService.execute(empresa.id)).resolves.not.toThrow();
        await expect(validarSetorAtivoParaVinculoService.execute(setor.id)).resolves.not.toThrow();
    });

    it('deve impedir exclusão de empresa com funcionários vinculados', async () => {
        const cargo = await criarCargoIntegracao(`${sufixo}-bloqueio`);
        const funcionario = await criarFuncionarioIntegracao({
            sufixo: `${sufixo}-bloqueio`,
            empresaId: empresaId,
            cargoId: cargo.id,
            setorId
        });

        funcionarioId = funcionario.id;
        cargoBloqueioId = cargo.id;

        await expect(deleteCompanyService.execute(empresaId)).rejects.toThrow(
            'Não é possível excluir esta empresa enquanto houver funcionários vinculados a ela.'
        );
    });
});
