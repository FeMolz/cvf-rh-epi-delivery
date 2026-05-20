import employeeRepository from '../repositories/EmployeeRepository.js';
import {
    MENSAGEM_CAMPOS_OBRIGATORIOS_FUNCIONARIO,
    MENSAGEM_CPF_DUPLICADO,
    MENSAGEM_DATA_NASCIMENTO_INVALIDA,
    MENSAGEM_EMAIL_DUPLICADO
} from '../constants/funcionarioConstantes.js';
import { montarDadosFuncionario } from '../utils/montarDadosFuncionario.js';
import { extrairDigitosCpf, validarCpf } from '../utils/validarCpf.js';
import { validarEmail } from '../utils/validarEmail.js';
import { validarTelefone } from '../utils/validarTelefone.js';

class CreateEmployeeService {
    /**
     * @param {Record<string, unknown>} entrada
     */
    async execute(entrada) {
        const { name, cpf, email, telefone, companyId, roleId, setorId, birthDate } = entrada;

        if (!name || !cpf || !email || !telefone || !companyId || !roleId || !setorId) {
            throw new Error(MENSAGEM_CAMPOS_OBRIGATORIOS_FUNCIONARIO);
        }

        if (birthDate === undefined || birthDate === null) {
            throw new Error(MENSAGEM_CAMPOS_OBRIGATORIOS_FUNCIONARIO);
        }

        if (typeof birthDate === 'string' && birthDate.trim() === '') {
            throw new Error(MENSAGEM_CAMPOS_OBRIGATORIOS_FUNCIONARIO);
        }

        const cpfValidado = validarCpf(cpf);
        const emailValidado = validarEmail(email);
        const telefoneValidado = validarTelefone(telefone);

        const dataNascimento =
            birthDate instanceof Date
                ? birthDate
                : new Date(typeof birthDate === 'string' ? birthDate.trim() : birthDate);

        if (Number.isNaN(dataNascimento.getTime())) {
            throw new Error(MENSAGEM_DATA_NASCIMENTO_INVALIDA);
        }

        const digitosCpfInformado = extrairDigitosCpf(cpfValidado);
        const funcionarios = await employeeRepository.findAll();

        if (
            funcionarios.some(
                funcionario => extrairDigitosCpf(funcionario.cpf) === digitosCpfInformado
            )
        ) {
            throw new Error(MENSAGEM_CPF_DUPLICADO);
        }
        if (funcionarios.some(funcionario => funcionario.email === emailValidado)) {
            throw new Error(MENSAGEM_EMAIL_DUPLICADO);
        }

        const dadosFuncionario = montarDadosFuncionario({
            ...entrada,
            cpf: cpfValidado,
            email: emailValidado,
            telefone: telefoneValidado,
            birthDate: dataNascimento
        });

        return employeeRepository.create(dadosFuncionario);
    }
}

export default new CreateEmployeeService();
