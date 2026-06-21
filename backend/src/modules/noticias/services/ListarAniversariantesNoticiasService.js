import noticiasRepository from '../repositories/NoticiasRepository.js';
import {
    montarAniversariantesEmpresa,
    montarAniversariantesPessoais,
    obterRotuloMesReferencia
} from '../utils/calcularAniversariantes.js';

class ListarAniversariantesNoticiasService {
  /**
   * @param {{ referencia?: Date }} [opcoes]
   */
    async execute({ referencia = new Date() } = {}) {
        const funcionarios = await noticiasRepository.findFuncionariosElegiveisAniversarios();

        return {
            mesReferencia: obterRotuloMesReferencia(referencia),
            aniversariantesPessoais: montarAniversariantesPessoais(funcionarios, referencia),
            aniversariantesEmpresa: montarAniversariantesEmpresa(funcionarios, referencia)
        };
    }
}

export default new ListarAniversariantesNoticiasService();
