import { MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO } from '../constants/recrutamentoConstantes.js';
import cadastroContratacaoRepository from '../repositories/CadastroContratacaoRepository.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

class GetCadastroContratacaoService {
    /**
     * @param {string} identificadorCadastro
     */
    async execute(identificadorCadastro) {
        const cadastro = await cadastroContratacaoRepository.findById(identificadorCadastro);
        if (!cadastro) {
            lancarErroRecrutamento(MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO);
        }
        return cadastro;
    }
}

export default new GetCadastroContratacaoService();
