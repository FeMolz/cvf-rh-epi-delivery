import noticiasRepository from '../repositories/NoticiasRepository.js';
import {
    montarPainelAfastamentosNoticias,
    obterMesReferenciaAfastamentos
} from '../utils/montarAfastamentosNoticias.js';

class ListarAfastamentosNoticiasService {
    async execute() {
        const funcionarios = await noticiasRepository.findFuncionariosEmAfastamentoTemporario();
        const dataReferencia = new Date();
        const painel = montarPainelAfastamentosNoticias(funcionarios, dataReferencia);

        return {
            mesReferencia: obterMesReferenciaAfastamentos(dataReferencia),
            ...painel
        };
    }
}

export default new ListarAfastamentosNoticiasService();
