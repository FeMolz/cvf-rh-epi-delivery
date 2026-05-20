import { ROTULOS_FICHA_FUNCIONARIO } from '../constants/funcionarioExportacaoConstantes.js';
import {
    formatarBooleanoPlanilha,
    formatarDataPlanilha,
    formatarTextoPlanilha
} from './formatarValorPlanilha.js';

/**
 * @param {Record<string, unknown>} funcionario
 * @returns {Array<{ campo: string, valor: string }>}
 */
export function montarParesExportacaoFichaFuncionario(funcionario) {
    const pares = [
        { chave: 'name', valor: formatarTextoPlanilha(funcionario.name) },
        { chave: 'cpf', valor: formatarTextoPlanilha(funcionario.cpf) },
        { chave: 'email', valor: formatarTextoPlanilha(funcionario.email) },
        { chave: 'telefone', valor: formatarTextoPlanilha(funcionario.telefone) },
        { chave: 'birthDate', valor: formatarDataPlanilha(funcionario.birthDate) },
        { chave: 'status', valor: formatarTextoPlanilha(funcionario.status) },
        { chave: 'admissionDate', valor: formatarDataPlanilha(funcionario.admissionDate) },
        { chave: 'resignationDate', valor: formatarDataPlanilha(funcionario.resignationDate) },
        { chave: 'nacionalidade', valor: formatarTextoPlanilha(funcionario.nacionalidade) },
        { chave: 'estadoCivil', valor: formatarTextoPlanilha(funcionario.estadoCivil) },
        { chave: 'racaCor', valor: formatarTextoPlanilha(funcionario.racaCor) },
        { chave: 'filiacao', valor: formatarTextoPlanilha(funcionario.filiacao) },
        { chave: 'grauInstrucao', valor: formatarTextoPlanilha(funcionario.grauInstrucao) },
        { chave: 'numeroCtps', valor: formatarTextoPlanilha(funcionario.numeroCtps) },
        { chave: 'serieCtps', valor: formatarTextoPlanilha(funcionario.serieCtps) },
        {
            chave: 'numeroDependentes',
            valor: formatarTextoPlanilha(funcionario.numeroDependentes)
        },
        { chave: 'pis', valor: formatarTextoPlanilha(funcionario.pis) },
        { chave: 'chavePix', valor: formatarTextoPlanilha(funcionario.chavePix) },
        { chave: 'cep', valor: formatarTextoPlanilha(funcionario.cep) },
        { chave: 'logradouro', valor: formatarTextoPlanilha(funcionario.logradouro) },
        { chave: 'numeroEndereco', valor: formatarTextoPlanilha(funcionario.numeroEndereco) },
        { chave: 'complemento', valor: formatarTextoPlanilha(funcionario.complemento) },
        { chave: 'bairro', valor: formatarTextoPlanilha(funcionario.bairro) },
        { chave: 'cidade', valor: formatarTextoPlanilha(funcionario.cidade) },
        { chave: 'estado', valor: formatarTextoPlanilha(funcionario.estado) },
        {
            chave: 'valeTransporte',
            valor: formatarBooleanoPlanilha(funcionario.valeTransporte)
        },
        {
            chave: 'valeAlimentacao',
            valor: formatarBooleanoPlanilha(funcionario.valeAlimentacao)
        },
        { chave: 'planoSaude', valor: formatarBooleanoPlanilha(funcionario.planoSaude) },
        { chave: 'cargo', valor: formatarTextoPlanilha(funcionario.role?.name) },
        { chave: 'empresa', valor: formatarTextoPlanilha(funcionario.company?.name) },
        { chave: 'setor', valor: formatarTextoPlanilha(funcionario.setor?.nome) }
    ];

    return pares.map(par => ({
        campo: ROTULOS_FICHA_FUNCIONARIO[par.chave],
        valor: par.valor
    }));
}
