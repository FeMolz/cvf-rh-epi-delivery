import {
    MENSAGEM_BLOCO_QUESITO_OBRIGATORIO,
    MENSAGEM_DESCRICAO_QUESITO_OBRIGATORIA,
    MENSAGEM_NOME_QUESITO_JA_CADASTRADO,
    MENSAGEM_NOME_QUESITO_OBRIGATORIO
} from '../constants/quesitoConstantes.js';
import quesitoRepository from '../repositories/QuesitoRepository.js';

class CreateQuesitoService {
    /**
     * @param {{ nome: string, descricao: string, bloco: string }} entrada
     */
    async execute(entrada) {
        const nome = typeof entrada.nome === 'string' ? entrada.nome.trim() : '';
        const descricao = typeof entrada.descricao === 'string' ? entrada.descricao.trim() : '';
        const bloco = typeof entrada.bloco === 'string' ? entrada.bloco.trim() : '';

        if (!nome) {
            throw new Error(MENSAGEM_NOME_QUESITO_OBRIGATORIO);
        }
        if (!descricao) {
            throw new Error(MENSAGEM_DESCRICAO_QUESITO_OBRIGATORIA);
        }
        if (!bloco) {
            throw new Error(MENSAGEM_BLOCO_QUESITO_OBRIGATORIO);
        }

        const existente = await quesitoRepository.findByNome(nome);
        if (existente) {
            throw new Error(MENSAGEM_NOME_QUESITO_JA_CADASTRADO);
        }

        return quesitoRepository.create({ nome, descricao, bloco });
    }
}

export default new CreateQuesitoService();
