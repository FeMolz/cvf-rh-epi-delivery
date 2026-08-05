import employeeRepository from '../repositories/EmployeeRepository.js';
import {
    montarWhereFerias,
    normalizarOrdenacaoFerias,
    normalizarPaginaFerias,
    normalizarTamanhoPaginaFerias,
    ORDENACAO_FERIAS_VENCIDOS_PRIMEIRO,
    ordenarFeriasProximosVencimentos,
    ordenarFeriasVencidosPrimeiro
} from '../utils/montarFiltroFeriasDepartamentoPessoal.js';

class ListarFeriasFuncionariosService {
    /**
     * @param {{
     *   busca?: string;
     *   ordenacao?: string;
     *   proximidade?: string | number;
     *   page?: string | number;
     *   pageSize?: string | number;
     * }} parametros
     */
    async execute(parametros = {}) {
        const ordenacao = normalizarOrdenacaoFerias(parametros.ordenacao);
        const proximidade = parametros.proximidade;
        const page = normalizarPaginaFerias(parametros.page);
        const pageSize = normalizarTamanhoPaginaFerias(parametros.pageSize);
        const where = montarWhereFerias({ ...parametros, proximidade });

        const funcionarios = await employeeRepository.findManyFerias(where);

        const ordenados =
            ordenacao === ORDENACAO_FERIAS_VENCIDOS_PRIMEIRO
                ? ordenarFeriasVencidosPrimeiro(funcionarios)
                : ordenarFeriasProximosVencimentos(funcionarios);

        const total = ordenados.length;
        const inicio = (page - 1) * pageSize;
        const items = ordenados.slice(inicio, inicio + pageSize);

        return {
            items,
            total,
            page,
            pageSize
        };
    }
}

export default new ListarFeriasFuncionariosService();
