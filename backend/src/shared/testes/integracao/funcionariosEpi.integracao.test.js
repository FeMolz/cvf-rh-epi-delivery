import listEmployeesService from '../../../modules/employees/services/ListEmployeesService.js';
import updateEmployeeService from '../../../modules/employees/services/UpdateEmployeeService.js';
import prisma from '../../../config/database.js';
import {
    criarDadosIntegracaoFuncionariosEpi,
    integracaoHabilitada,
    limparDadosIntegracaoFuncionariosEpi,
    verificarConexaoBancoIntegracao
} from './utilitariosBancoIntegracao.js';

const describeIntegracao = integracaoHabilitada() ? describe : describe.skip;

/**
 * @param {number} diasAFrente
 * @returns {string} Data ISO (YYYY-MM-DD) estritamente futura.
 */
function dataRetornoFuturaIso(diasAFrente = 30) {
    const data = new Date();
    data.setHours(0, 0, 0, 0);
    data.setDate(data.getDate() + diasAFrente);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

describeIntegracao('Integração — filtros de funcionários e pausa de EPI', () => {
    /** @type {Awaited<ReturnType<typeof criarDadosIntegracaoFuncionariosEpi>>} */
    let dadosTeste;

    beforeAll(async () => {
        await verificarConexaoBancoIntegracao();
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
            leaveReturnDate: dataRetornoFuturaIso(30)
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

        // Garante estado pausado independente da ordem/resultado dos testes anteriores.
        await prisma.employee.update({
            where: { id: dadosTeste.funcionarioAtivo.id },
            data: {
                status: 'FERIAS',
                leaveReturnDate: new Date(dataRetornoFuturaIso(30))
            }
        });
        await prisma.epiDelivery.update({
            where: { id: dadosTeste.entregaEpi.id },
            data: {
                nextDueDate: null,
                vencimentoSuspenso: dadosTeste.vencimentoOriginal,
                periodicidadePausadaEm: pausaSimuladaEm
            }
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
