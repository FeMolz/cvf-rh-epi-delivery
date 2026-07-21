import prisma from '../../../config/database.js';
import linkEpiToRoleService from '../../../modules/chaining/epiToRole/services/LinkEpiToRoleService.js';
import listEpisByRoleService from '../../../modules/chaining/epiToRole/services/ListEpisByRoleService.js';
import unlinkEpiFromRoleService from '../../../modules/chaining/epiToRole/services/UnlinkEpiFromRoleService.js';
import { criarCargoIntegracao } from './utilitarios/fabricaCargo.js';
import { criarEpiIntegracao } from './utilitarios/fabricaEpi.js';
import { exigirIntegracaoHabilitada, verificarConexaoBancoIntegracao } from './utilitariosBancoIntegracao.js';
import { limparCargoComDependencias, limparEpi } from './utilitarios/limpeza.js';

describe('Integração — vínculos de EPI com cargo', () => {
    const sufixo = `${Date.now()}`;
    /** @type {string | null} */
    let cargoId = null;
    /** @type {string | null} */
    let epiId = null;

    beforeAll(async () => {
        exigirIntegracaoHabilitada();
        await verificarConexaoBancoIntegracao();
        const cargo = await criarCargoIntegracao(sufixo);
        const epi = await criarEpiIntegracao(sufixo);
        cargoId = cargo.id;
        epiId = epi.id;
    });

    afterAll(async () => {
        if (cargoId) {
            await limparCargoComDependencias(cargoId);
        }
        if (epiId) {
            await limparEpi(epiId);
        }
        await prisma.$disconnect();
    });

    it('deve vincular EPI existente ao cargo e listar vínculos', async () => {
        const epi = await prisma.epi.findUnique({ where: { id: epiId } });

        const vinculo = await linkEpiToRoleService.execute({
            roleId: cargoId,
            caNumber: epi.caNumber,
            periodicityDays: 180
        });

        expect(vinculo.roleId).toBe(cargoId);

        const episVinculados = await listEpisByRoleService.execute(cargoId);
        expect(episVinculados.some((item) => item.epiId === epiId)).toBe(true);
    });

    it('deve desvincular EPI do cargo', async () => {
        await unlinkEpiFromRoleService.execute({ roleId: cargoId, epiId });

        const episVinculados = await listEpisByRoleService.execute(cargoId);
        expect(episVinculados.some((item) => item.epiId === epiId)).toBe(false);
    });
});
