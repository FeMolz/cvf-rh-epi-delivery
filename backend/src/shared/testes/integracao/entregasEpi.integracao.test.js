import createEpiDeliveryService from '../../../modules/epiDeliveries/services/CreateEpiDeliveryService.js';
import listEpiDeliveriesByEmployeeService from '../../../modules/epiDeliveries/services/ListEpiDeliveriesByEmployeeService.js';
import updateEmployeeService from '../../../modules/employees/services/UpdateEmployeeService.js';
import prisma from '../../../config/database.js';
import { criarFuncionarioIntegracao } from './utilitarios/fabricaFuncionario.js';
import {
    criarDadosIntegracaoFuncionariosEpi,
    integracaoHabilitada,
    limparDadosIntegracaoFuncionariosEpi,
    verificarConexaoBancoIntegracao
} from './utilitariosBancoIntegracao.js';
import { limparFuncionarios } from './utilitarios/limpeza.js';

const describeIntegracao = integracaoHabilitada() ? describe : describe.skip;

describeIntegracao('Integração — entregas de EPI', () => {
    const sufixo = `${Date.now()}`;
    /** @type {Awaited<ReturnType<typeof criarDadosIntegracaoFuncionariosEpi>>} */
    let dadosTeste;
    /** @type {string | null} */
    let funcionarioEntregaId = null;

    beforeAll(async () => {
        await verificarConexaoBancoIntegracao();
        dadosTeste = await criarDadosIntegracaoFuncionariosEpi(sufixo);
    });

    afterAll(async () => {
        if (funcionarioEntregaId) {
            await limparFuncionarios([funcionarioEntregaId]);
        }
        if (dadosTeste) {
            await limparDadosIntegracaoFuncionariosEpi(dadosTeste);
        }
        await prisma.$disconnect();
    });

    it('deve registrar entrega via CreateEpiDeliveryService e listar no painel do funcionário', async () => {
        const epi = await prisma.epi.findUnique({ where: { id: dadosTeste.epi.id } });
        const funcionarioNovo = await criarFuncionarioIntegracao({
            sufixo: `${sufixo}-entrega`,
            empresaId: dadosTeste.empresa.id,
            cargoId: dadosTeste.cargo.id,
            setorId: dadosTeste.setor.id,
            status: 'ATIVO'
        });

        funcionarioEntregaId = funcionarioNovo.id;

        const resultado = await createEpiDeliveryService.execute({
            employeeId: funcionarioNovo.id,
            caNumbers: [epi.caNumber],
            deliveredById: dadosTeste.usuarioEntregador.id,
            deliveryDate: '2025-12-15'
        });

        expect(resultado.count).toBe(1);

        const entregas = await listEpiDeliveriesByEmployeeService.execute(funcionarioNovo.id);
        expect(entregas.some((entrega) => entrega.epiId === dadosTeste.epi.id)).toBe(true);
    });

    it('mudança de ATIVO para FERIAS deve pausar periodicidade do EPI', async () => {
        await updateEmployeeService.execute(dadosTeste.funcionarioAtivo.id, {
            status: 'FERIAS',
            leaveReturnDate: '2026-08-01'
        });

        const entregaAtualizada = await prisma.epiDelivery.findUnique({
            where: { id: dadosTeste.entregaEpi.id }
        });

        expect(entregaAtualizada.nextDueDate).toBeNull();
        expect(entregaAtualizada.vencimentoSuspenso).toEqual(dadosTeste.vencimentoOriginal);
        expect(entregaAtualizada.periodicidadePausadaEm).toBeInstanceOf(Date);
    });

    it('retorno para ATIVO deve retomar periodicidade do EPI', async () => {
        const pausaSimuladaEm = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        await prisma.epiDelivery.update({
            where: { id: dadosTeste.entregaEpi.id },
            data: { periodicidadePausadaEm: pausaSimuladaEm }
        });

        await updateEmployeeService.execute(dadosTeste.funcionarioAtivo.id, { status: 'ATIVO' });

        const entregaRetomada = await prisma.epiDelivery.findUnique({
            where: { id: dadosTeste.entregaEpi.id }
        });

        const vencimentoEsperado = new Date(
            dadosTeste.vencimentoOriginal.getTime() + (Date.now() - pausaSimuladaEm.getTime())
        );

        expect(entregaRetomada.vencimentoSuspenso).toBeNull();
        expect(entregaRetomada.periodicidadePausadaEm).toBeNull();
        expect(entregaRetomada.nextDueDate).toBeInstanceOf(Date);
        expect(entregaRetomada.nextDueDate.getTime()).toBeGreaterThan(
            dadosTeste.vencimentoOriginal.getTime()
        );
        expect(
            Math.abs(entregaRetomada.nextDueDate.getTime() - vencimentoEsperado.getTime())
        ).toBeLessThan(1000);
    });
});
