import {
    aplicarMascaraCpf,
    aplicarMascaraTelefone
} from '../../../shared/utils/formatadoresBrasil.js';

/**
 * Converte a resposta da API em estado inicial do formulário multi-etapas.
 * @param {Record<string, unknown>} funcionario
 */
export function mapearFuncionarioParaFormulario(funcionario) {
    return {
        name: String(funcionario.name || ''),
        cpf: aplicarMascaraCpf(funcionario.cpf || ''),
        email: String(funcionario.email || ''),
        telefone: aplicarMascaraTelefone(funcionario.telefone || ''),
        birthDate: funcionario.birthDate ? String(funcionario.birthDate).slice(0, 10) : '',
        admissionDate: funcionario.admissionDate
            ? String(funcionario.admissionDate).slice(0, 10)
            : '',
        resignationDate: funcionario.resignationDate
            ? String(funcionario.resignationDate).slice(0, 10)
            : '',
        leaveReturnDate: funcionario.leaveReturnDate
            ? String(funcionario.leaveReturnDate).slice(0, 10)
            : '',
        status: String(funcionario.status || 'ATIVO'),
        companyId: String(funcionario.companyId || ''),
        roleId: String(funcionario.roleId || ''),
        setorId: String(funcionario.setorId || ''),
        nacionalidade: String(funcionario.nacionalidade || ''),
        estadoCivil: String(funcionario.estadoCivil || ''),
        racaCor: String(funcionario.racaCor || ''),
        filiacao: String(funcionario.filiacao || ''),
        grauInstrucao: String(funcionario.grauInstrucao || ''),
        numeroCtps: String(funcionario.numeroCtps || ''),
        serieCtps: String(funcionario.serieCtps || ''),
        numeroDependentes:
            funcionario.numeroDependentes === null || funcionario.numeroDependentes === undefined
                ? ''
                : String(funcionario.numeroDependentes),
        pis: String(funcionario.pis || ''),
        chavePix: String(funcionario.chavePix || ''),
        cep: String(funcionario.cep || ''),
        logradouro: String(funcionario.logradouro || ''),
        numeroEndereco: String(funcionario.numeroEndereco || ''),
        complemento: String(funcionario.complemento || ''),
        bairro: String(funcionario.bairro || ''),
        cidade: String(funcionario.cidade || ''),
        estado: String(funcionario.estado || ''),
        valeTransporte: Boolean(funcionario.valeTransporte),
        valeAlimentacao: Boolean(funcionario.valeAlimentacao),
        planoSaude: Boolean(funcionario.planoSaude)
    };
}
