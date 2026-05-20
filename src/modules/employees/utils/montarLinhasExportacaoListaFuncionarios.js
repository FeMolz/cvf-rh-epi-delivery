import { STATUS_FUNCIONARIO_INATIVOS } from '../constants/funcionarioExportacaoConstantes.js';
import { formatarDataPlanilha, formatarTextoPlanilha } from './formatarValorPlanilha.js';

/**
 * @param {Array<{ name: string, status: string, resignationDate?: Date|null, role?: { name: string }, setor?: { nome: string } }>} funcionarios
 * @returns {Array<{ nome: string, cargo: string, setor: string, status: string, dataDemissao: string }>}
 */
export function montarLinhasExportacaoListaFuncionarios(funcionarios) {
    return funcionarios.map(funcionario => {
        const statusInativo = STATUS_FUNCIONARIO_INATIVOS.includes(funcionario.status);

        return {
            nome: formatarTextoPlanilha(funcionario.name),
            cargo: formatarTextoPlanilha(funcionario.role?.name),
            setor: formatarTextoPlanilha(funcionario.setor?.nome),
            status: formatarTextoPlanilha(funcionario.status),
            dataDemissao: statusInativo ? formatarDataPlanilha(funcionario.resignationDate) : ''
        };
    });
}
