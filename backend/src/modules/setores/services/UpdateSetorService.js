import setorRepository from '../repositories/SetorRepository.js';
import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import {
    MENSAGEM_NOME_SETOR_JA_CADASTRADO,
    MENSAGEM_NOME_SETOR_OBRIGATORIO,
    MENSAGEM_SETOR_NAO_ENCONTRADO
} from '../constants/setorConstantes.js';

class UpdateSetorService {
    /**
     * @param {string} identificadorSetor
     * @param {{ nome: string, isActive?: boolean }} dadosAtualizacao
     */
    async execute(identificadorSetor, dadosAtualizacao) {
        const setor = await setorRepository.findById(identificadorSetor);

        if (!setor) {
            throw criarErroNaoEncontrado(MENSAGEM_SETOR_NAO_ENCONTRADO);
        }

        const nome = typeof dadosAtualizacao.nome === 'string' ? dadosAtualizacao.nome.trim() : '';
        const isActive = dadosAtualizacao.isActive ?? setor.isActive;

        if (!nome) {
            throw criarErroHttp(MENSAGEM_NOME_SETOR_OBRIGATORIO);
        }

        const setorComMesmoNome = await setorRepository.findByNome(nome, identificadorSetor);

        if (setorComMesmoNome) {
            throw criarErroHttp(MENSAGEM_NOME_SETOR_JA_CADASTRADO, 409);
        }

        return setorRepository.update(identificadorSetor, { nome, isActive });
    }
}

export default new UpdateSetorService();
