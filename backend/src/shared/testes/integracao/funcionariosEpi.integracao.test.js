import listEmployeesService from '../../../modules/employees/services/ListEmployeesService.js';
import updateEmployeeService from '../../../modules/employees/services/UpdateEmployeeService.js';
import prisma from '../../../config/database.js';
import {
    criarDadosIntegracaoFuncionariosEpi,
    integracaoHabilitada,
    limparDadosIntegracaoFuncionariosEpi
} from './utilitariosBancoIntegracao.js';

const describeIntegracao = integracaoHabilitada() ? describe : describe.skip;

describeIntegracao('Integração — filtros de funcionários e pausa de EPI', () => {
    /** @type {Awaited<ReturnType<typeof criarDadosIntegracaoFuncionariosEpi>>} */
    let dadosTeste;

    beforeAll(async () => {
        const sufixo = `${Date.now()}`;
        dadosTeste = await criarDadosIntegracaoFuncionariosEpi(sufixo);
    });

    afterAll(async () => {
        if (dadosTeste) {
            await limparDadosIntegracaoFuncionariosEpi(dadosTeste);
        }
        await prisma.$disconnect();
    });

    it('filtro ativos deve retornar somente funcionários com status ATIVO', async () => {
        const funcionarios = await listEmployeesService.execute('ativos');
        const identificadores = funcionarios.map(funcionario => funcionario.id);

        expect(identificadores).toContain(dadosTeste.funcionarioAtivo.id);
        expect(identificadores).not.toContain(dadosTeste.funcionarioFerias.id);
        expect(identificadores).not.toContain(dadosTeste.funcionarioInativo.id);
    });

    it('filtro afastados deve incluir funcionário em FERIAS', async () => {
        const funcionarios = await listEmployeesService.execute('afastados');
        const identificadores = funcionarios.map(funcionario => funcionario.id);

        expect(identificadores).toContain(dadosTeste.funcionarioFerias.id);
        expect(identificadores).not.toContain(dadosTeste.funcionarioAtivo.id);
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
            dadosTeste.vencimentoOriginal.getTime() +
                (Date.now() - pausaSimuladaEm.getTime())
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
