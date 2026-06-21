import employeeRepository from '../repositories/EmployeeRepository.js';
import validarEmpresaAtivaParaVinculoService from '../../companies/services/ValidarEmpresaAtivaParaVinculoService.js';
import validarCargoAtivoParaVinculoService from '../../roles/services/ValidarCargoAtivoParaVinculoService.js';
import {
    MENSAGEM_CAMPOS_OBRIGATORIOS_FUNCIONARIO,
    MENSAGEM_CPF_DUPLICADO,
    MENSAGEM_DATA_NASCIMENTO_INVALIDA,
    MENSAGEM_EMAIL_DUPLICADO
} from '../constants/funcionarioConstantes.js';
import { montarDadosFuncionario } from '../utils/montarDadosFuncionario.js';
import { lancarErroFuncionario } from '../utils/lancarErroFuncionario.js';
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
            lancarErroFuncionario(MENSAGEM_CAMPOS_OBRIGATORIOS_FUNCIONARIO);
        }

        if (birthDate === undefined || birthDate === null) {
            lancarErroFuncionario(MENSAGEM_CAMPOS_OBRIGATORIOS_FUNCIONARIO);
        }

        if (typeof birthDate === 'string' && birthDate.trim() === '') {
            lancarErroFuncionario(MENSAGEM_CAMPOS_OBRIGATORIOS_FUNCIONARIO);
        }

        const cpfValidado = validarCpf(cpf);
        const emailValidado = validarEmail(email);
        const telefoneValidado = validarTelefone(telefone);

        const dataNascimento =
            birthDate instanceof Date
                ? birthDate
                : new Date(typeof birthDate === 'string' ? birthDate.trim() : birthDate);

        if (Number.isNaN(dataNascimento.getTime())) {
            lancarErroFuncionario(MENSAGEM_DATA_NASCIMENTO_INVALIDA);
        }

        const digitosCpfInformado = extrairDigitosCpf(cpfValidado);
        const funcionarios = await employeeRepository.findAll();

        if (
            funcionarios.some(
                funcionario => extrairDigitosCpf(funcionario.cpf) === digitosCpfInformado
            )
        ) {
            lancarErroFuncionario(MENSAGEM_CPF_DUPLICADO);
        }
        if (funcionarios.some(funcionario => funcionario.email === emailValidado)) {
            lancarErroFuncionario(MENSAGEM_EMAIL_DUPLICADO);
        }

        await validarEmpresaAtivaParaVinculoService.execute(String(companyId));
        await validarCargoAtivoParaVinculoService.execute(String(roleId));

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
