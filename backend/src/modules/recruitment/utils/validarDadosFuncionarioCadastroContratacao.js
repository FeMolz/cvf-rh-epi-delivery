import {
    MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO,
    MENSAGEM_CARGO_NAO_EDITAVEL,
    MENSAGEM_EMPRESA_NAO_EDITAVEL,
    MENSAGEM_SETOR_NAO_EDITAVEL
} from '../constants/recrutamentoConstantes.js';
import { MENSAGEM_DATA_NASCIMENTO_INVALIDA } from '../../employees/constants/funcionarioConstantes.js';
import { validarCpf } from '../../employees/utils/validarCpf.js';
import { validarEmail } from '../../employees/utils/validarEmail.js';
import { validarTelefone } from '../../employees/utils/validarTelefone.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

/**
 * @param {object} entrada
 * @param {{ roleId: string, companyId: string, setorId: string }} vinculosBloqueados
 */
export function validarDadosFuncionarioCadastroContratacao(entrada, vinculosBloqueados) {
    if (entrada.roleId && entrada.roleId !== vinculosBloqueados.roleId) {
        lancarErroRecrutamento(MENSAGEM_CARGO_NAO_EDITAVEL);
    }
    if (entrada.companyId && entrada.companyId !== vinculosBloqueados.companyId) {
        lancarErroRecrutamento(MENSAGEM_EMPRESA_NAO_EDITAVEL);
    }
    if (entrada.setorId && entrada.setorId !== vinculosBloqueados.setorId) {
        lancarErroRecrutamento(MENSAGEM_SETOR_NAO_EDITAVEL);
    }

    const nome = typeof entrada.name === 'string' ? entrada.name.trim() : '';
    const cpfBruto = typeof entrada.cpf === 'string' ? entrada.cpf.trim() : '';
    const emailBruto = typeof entrada.email === 'string' ? entrada.email.trim() : '';
    const telefoneBruto = typeof entrada.telefone === 'string' ? entrada.telefone.trim() : '';
    const dataNascimentoBruta = entrada.birthDate;

    if (!nome || !cpfBruto || !emailBruto || !telefoneBruto || !dataNascimentoBruta) {
        lancarErroRecrutamento(MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO);
    }

    const cpf = validarCpf(cpfBruto);
    const email = validarEmail(emailBruto);
    const telefone = validarTelefone(telefoneBruto);

    const dataNascimento =
        dataNascimentoBruta instanceof Date
            ? dataNascimentoBruta
            : new Date(typeof dataNascimentoBruta === 'string' ? dataNascimentoBruta.trim() : dataNascimentoBruta);

    if (Number.isNaN(dataNascimento.getTime())) {
        lancarErroRecrutamento(MENSAGEM_DATA_NASCIMENTO_INVALIDA);
    }

    return {
        name: nome,
        cpf,
        email,
        telefone,
        birthDate: dataNascimento,
        roleId: vinculosBloqueados.roleId,
        companyId: vinculosBloqueados.companyId,
        setorId: vinculosBloqueados.setorId
    };
}
