import employeeRepository from '../repositories/EmployeeRepository.js';
import {
    MENSAGEM_CPF_DUPLICADO,
    MENSAGEM_EMAIL_DUPLICADO
} from '../constants/funcionarioConstantes.js';
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
        if (!funcionarioExistente || funcionarioExistente.deletedAt) {
            const erro = new Error('Funcionário não encontrado');
            erro.code = 'NOT_FOUND';
            throw erro;
        }

        const dadosAtualizacao = { ...entrada };

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
                throw new Error(MENSAGEM_CPF_DUPLICADO);
            }
        }

        if (dadosAtualizacao.email !== undefined) {
            if (outrosFuncionarios.some(funcionario => funcionario.email === dadosAtualizacao.email)) {
                throw new Error(MENSAGEM_EMAIL_DUPLICADO);
            }
        }

        return employeeRepository.update(funcionarioId, dadosAtualizacao);
    }
}

export default new UpdateEmployeeService();
