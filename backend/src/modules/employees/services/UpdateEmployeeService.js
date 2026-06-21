import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { statusFuncionarioEncerraVinculo } from '../../../shared/constants/funcionarioVinculoConstantes.js';
import gerenciarPeriodicidadeEpiFuncionarioService from '../../epiDeliveries/services/GerenciarPeriodicidadeEpiFuncionarioService.js';
import validarCargoAtivoParaVinculoService from '../../roles/services/ValidarCargoAtivoParaVinculoService.js';
import {
    MENSAGEM_CPF_DUPLICADO,
    MENSAGEM_EMAIL_DUPLICADO,
    MENSAGEM_DATA_NASCIMENTO_INVALIDA
} from '../constants/funcionarioConstantes.js';
import employeeRepository from '../repositories/EmployeeRepository.js';
import { normalizarDatasAtualizacaoFuncionario } from '../utils/montarDadosFuncionario.js';
import { extrairDigitosCpf, validarCpf } from '../utils/validarCpf.js';
import { validarEmail } from '../utils/validarEmail.js';
import { validarTelefone } from '../utils/validarTelefone.js';

class UpdateEmployeeService {
    /**
     * @param {string} funcionarioId
     * @param {Record<string, unknown>} entrada
     */
    async execute(funcionarioId, entrada) {
        const funcionarioExistente = await employeeRepository.findById(funcionarioId);
        if (!funcionarioExistente) {
            throw criarErroNaoEncontrado('Funcionário não encontrado');
        }

        const dadosAtualizacao = { ...entrada };
        const statusAnterior = String(funcionarioExistente.status || '');
        const statusNovo =
            dadosAtualizacao.status !== undefined
                ? String(dadosAtualizacao.status)
                : statusAnterior;

        if (dadosAtualizacao.status !== undefined) {
            if (statusFuncionarioEncerraVinculo(statusNovo) && !statusFuncionarioEncerraVinculo(statusAnterior)) {
                dadosAtualizacao.deletedAt = new Date();
            }

            if (!statusFuncionarioEncerraVinculo(statusNovo) && statusFuncionarioEncerraVinculo(statusAnterior)) {
                dadosAtualizacao.deletedAt = null;
            }
        }

        const roleIdEfetivo =
            dadosAtualizacao.roleId !== undefined
                ? dadosAtualizacao.roleId
                : funcionarioExistente.roleId;

        if (dadosAtualizacao.roleId !== undefined || !statusFuncionarioEncerraVinculo(statusNovo)) {
            await validarCargoAtivoParaVinculoService.execute(String(roleIdEfetivo));
        }

        if (entrada.cpf !== undefined) {
            dadosAtualizacao.cpf = validarCpf(entrada.cpf);
        }
        if (entrada.email !== undefined) {
            dadosAtualizacao.email = validarEmail(entrada.email);
        }
        if (entrada.telefone !== undefined) {
            dadosAtualizacao.telefone = validarTelefone(entrada.telefone);
        }

        const funcionarios = await employeeRepository.findAll();
        const outrosFuncionarios = funcionarios.filter(funcionario => funcionario.id !== funcionarioId);

        if (dadosAtualizacao.cpf !== undefined) {
            const digitosCpf = extrairDigitosCpf(dadosAtualizacao.cpf);
            if (
                outrosFuncionarios.some(
                    funcionario => extrairDigitosCpf(funcionario.cpf) === digitosCpf
                )
            ) {
                throw criarErroHttp(MENSAGEM_CPF_DUPLICADO);
            }
        }

        if (dadosAtualizacao.email !== undefined) {
            if (outrosFuncionarios.some(funcionario => funcionario.email === dadosAtualizacao.email)) {
                throw criarErroHttp(MENSAGEM_EMAIL_DUPLICADO);
            }
        }

        const dadosNormalizados = normalizarDatasAtualizacaoFuncionario(dadosAtualizacao);

        if (
            dadosNormalizados.birthDate !== undefined &&
            dadosNormalizados.birthDate === null
        ) {
            throw criarErroHttp(MENSAGEM_DATA_NASCIMENTO_INVALIDA);
        }

        const funcionarioAtualizado = await employeeRepository.update(
            funcionarioId,
            dadosNormalizados
        );

        if (dadosAtualizacao.status !== undefined) {
            await gerenciarPeriodicidadeEpiFuncionarioService.sincronizarPorMudancaStatus(
                funcionarioExistente.status,
                funcionarioAtualizado.status,
                funcionarioId
            );
        }

        return funcionarioAtualizado;
    }
}

export default new UpdateEmployeeService();
