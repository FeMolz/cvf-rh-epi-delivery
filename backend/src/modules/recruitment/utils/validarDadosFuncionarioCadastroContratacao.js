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
import { lancarErroRecrutamento } from './lancarErroRecrutamento.js';

/** Campos visíveis e obrigatórios no formulário público do candidato (exceto complemento). */
export const CAMPOS_OBRIGATORIOS_CADASTRO_PUBLICO = [
    'name',
    'cpf',
    'email',
    'telefone',
    'birthDate',
    'nacionalidade',
    'estadoCivil',
    'racaCor',
    'filiacao',
    'grauInstrucao',
    'numeroCtps',
    'serieCtps',
    'numeroDependentes',
    'pis',
    'chavePix',
    'cep',
    'logradouro',
    'numeroEndereco',
    'bairro',
    'cidade',
    'estado'
];

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

    const nacionalidade =
        typeof entrada.nacionalidade === 'string' ? entrada.nacionalidade.trim() : '';
    const estadoCivil = typeof entrada.estadoCivil === 'string' ? entrada.estadoCivil.trim() : '';
    const racaCor = typeof entrada.racaCor === 'string' ? entrada.racaCor.trim() : '';
    const filiacao = typeof entrada.filiacao === 'string' ? entrada.filiacao.trim() : '';
    const grauInstrucao =
        typeof entrada.grauInstrucao === 'string' ? entrada.grauInstrucao.trim() : '';
    const numeroCtps = typeof entrada.numeroCtps === 'string' ? entrada.numeroCtps.trim() : '';
    const serieCtps = typeof entrada.serieCtps === 'string' ? entrada.serieCtps.trim() : '';
    const pis = typeof entrada.pis === 'string' ? entrada.pis.trim() : '';
    const chavePix = typeof entrada.chavePix === 'string' ? entrada.chavePix.trim() : '';
    const cep = typeof entrada.cep === 'string' ? entrada.cep.trim() : '';
    const logradouro = typeof entrada.logradouro === 'string' ? entrada.logradouro.trim() : '';
    const numeroEndereco =
        typeof entrada.numeroEndereco === 'string' ? entrada.numeroEndereco.trim() : '';
    const bairro = typeof entrada.bairro === 'string' ? entrada.bairro.trim() : '';
    const cidade = typeof entrada.cidade === 'string' ? entrada.cidade.trim() : '';
    const estado = typeof entrada.estado === 'string' ? entrada.estado.trim() : '';

    const numeroDependentesInformado =
        entrada.numeroDependentes !== undefined &&
        entrada.numeroDependentes !== null &&
        entrada.numeroDependentes !== '';

    if (
        !nome ||
        !cpfBruto ||
        !emailBruto ||
        !telefoneBruto ||
        !dataNascimentoBruta ||
        !nacionalidade ||
        !estadoCivil ||
        !racaCor ||
        !filiacao ||
        !grauInstrucao ||
        !numeroCtps ||
        !serieCtps ||
        !numeroDependentesInformado ||
        !pis ||
        !chavePix ||
        !cep ||
        !logradouro ||
        !numeroEndereco ||
        !bairro ||
        !cidade ||
        !estado
    ) {
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

    const numeroDependentes = Number(entrada.numeroDependentes);
    if (Number.isNaN(numeroDependentes) || numeroDependentes < 0) {
        lancarErroRecrutamento(MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO);
    }

    const resultado = {
        name: nome,
        cpf,
        email,
        telefone,
        birthDate: dataNascimento,
        roleId: vinculosBloqueados.roleId,
        companyId: vinculosBloqueados.companyId,
        setorId: vinculosBloqueados.setorId,
        nacionalidade,
        estadoCivil,
        racaCor,
        filiacao,
        grauInstrucao,
        numeroCtps,
        serieCtps,
        numeroDependentes,
        pis,
        chavePix,
        cep,
        logradouro,
        numeroEndereco,
        bairro,
        cidade,
        estado
    };

    if (typeof entrada.complemento === 'string' && entrada.complemento.trim()) {
        resultado.complemento = entrada.complemento.trim();
    }

    return resultado;
}
