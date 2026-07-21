import { criarCargoIntegracao } from './utilitarios/fabricaCargo.js';
import { criarEmpresaIntegracao, criarSetorIntegracao } from './utilitarios/fabricaEmpresa.js';
import { criarEntregaEpiIntegracao } from './utilitarios/fabricaEntregaEpi.js';
import { criarEpiIntegracao, criarVinculoEpiCargoIntegracao } from './utilitarios/fabricaEpi.js';
import { criarFuncionarioIntegracao } from './utilitarios/fabricaFuncionario.js';
import { criarUsuarioIntegracao } from './utilitarios/fabricaUsuario.js';
import {
    limparCargoComDependencias,
    limparEmpresa,
    limparEntregasEpi,
    limparEpi,
    limparFuncionarios,
    limparSetor,
    limparUsuario
} from './utilitarios/limpeza.js';

export { verificarConexaoBancoIntegracao, integracaoHabilitada } from './utilitarios/conexao.js';

/**
 * @param {string} sufixo
 */
export async function criarDadosIntegracaoFuncionariosEpi(sufixo) {
    const empresa = await criarEmpresaIntegracao(sufixo);
    const setor = await criarSetorIntegracao(sufixo);
    const cargo = await criarCargoIntegracao(sufixo);
    const usuarioEntregador = await criarUsuarioIntegracao({ sufixo, role: 'ALMOXARIFADO' });
    const epi = await criarEpiIntegracao(sufixo);

    await criarVinculoEpiCargoIntegracao({ cargoId: cargo.id, epiId: epi.id });

    const funcionarioAtivo = await criarFuncionarioIntegracao({
        sufixo: `${sufixo}-ativo`,
        empresaId: empresa.id,
        cargoId: cargo.id,
        setorId: setor.id,
        status: 'ATIVO'
    });

    const funcionarioFerias = await criarFuncionarioIntegracao({
        sufixo: `${sufixo}-ferias`,
        empresaId: empresa.id,
        cargoId: cargo.id,
        setorId: setor.id,
        status: 'FERIAS'
    });

    const funcionarioInativo = await criarFuncionarioIntegracao({
        sufixo: `${sufixo}-inativo`,
        empresaId: empresa.id,
        cargoId: cargo.id,
        setorId: setor.id,
        status: 'INATIVO'
    });

    const vencimentoOriginal = new Date('2026-06-01');
    const entregaEpi = await criarEntregaEpiIntegracao({
        employeeId: funcionarioAtivo.id,
        epiId: epi.id,
        deliveredById: usuarioEntregador.id,
        nextDueDate: vencimentoOriginal
    });

    return {
        empresa,
        setor,
        cargo,
        usuarioEntregador,
        epi,
        funcionarioAtivo,
        funcionarioFerias,
        funcionarioInativo,
        entregaEpi,
        vencimentoOriginal
    };
}

/**
 * @param {Awaited<ReturnType<typeof criarDadosIntegracaoFuncionariosEpi>>} dados
 */
export async function limparDadosIntegracaoFuncionariosEpi(dados) {
    await limparEntregasEpi([dados.entregaEpi.id]);
    await limparFuncionarios([
        dados.funcionarioAtivo.id,
        dados.funcionarioFerias.id,
        dados.funcionarioInativo.id
    ]);
    await limparCargoComDependencias(dados.cargo.id);
    await limparEpi(dados.epi.id);
    await limparUsuario(dados.usuarioEntregador.id);
    await limparSetor(dados.setor.id);
    await limparEmpresa(dados.empresa.id);
}
