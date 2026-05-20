import {
    MENSAGEM_BLOCO_QUESITO_OBRIGATORIO,
    MENSAGEM_CAMPOS_ATUALIZACAO_QUESITO_VAZIOS,
    MENSAGEM_DESCRICAO_QUESITO_OBRIGATORIA,
    MENSAGEM_NOME_QUESITO_JA_CADASTRADO,
    MENSAGEM_NOME_QUESITO_OBRIGATORIO,
    MENSAGEM_QUESITO_NAO_ENCONTRADO
} from '../constants/quesitoConstantes.js';
import quesitoRepository from '../repositories/QuesitoRepository.js';

class UpdateQuesitoService {
    /**
     * @param {string} identificadorQuesito
     * @param {{ nome?: string, descricao?: string, bloco?: string }} entrada
     */
    async execute(identificadorQuesito, entrada) {
        const dadosEntrada =
            entrada !== null && typeof entrada === 'object' ? entrada : {};

        const quesitoExistente = await quesitoRepository.findById(identificadorQuesito);
        if (!quesitoExistente) {
            throw new Error(MENSAGEM_QUESITO_NAO_ENCONTRADO);
        }

        const dadosAtualizacao = {};

        if (dadosEntrada.nome !== undefined) {
            const nome = typeof dadosEntrada.nome === 'string' ? dadosEntrada.nome.trim() : '';
            if (!nome) {
                throw new Error(MENSAGEM_NOME_QUESITO_OBRIGATORIO);
            }
            if (nome !== quesitoExistente.nome) {
                const quesitoComMesmoNome = await quesitoRepository.findByNome(nome);
                if (quesitoComMesmoNome) {
                    throw new Error(MENSAGEM_NOME_QUESITO_JA_CADASTRADO);
                }
            }
            dadosAtualizacao.nome = nome;
        }

        if (dadosEntrada.descricao !== undefined) {
            const descricao =
                typeof dadosEntrada.descricao === 'string' ? dadosEntrada.descricao.trim() : '';
            if (!descricao) {
                throw new Error(MENSAGEM_DESCRICAO_QUESITO_OBRIGATORIA);
            }
            dadosAtualizacao.descricao = descricao;
        }

        if (dadosEntrada.bloco !== undefined) {
            const bloco = typeof dadosEntrada.bloco === 'string' ? dadosEntrada.bloco.trim() : '';
            if (!bloco) {
                throw new Error(MENSAGEM_BLOCO_QUESITO_OBRIGATORIO);
            }
            dadosAtualizacao.bloco = bloco;
        }

        if (Object.keys(dadosAtualizacao).length === 0) {
            throw new Error(MENSAGEM_CAMPOS_ATUALIZACAO_QUESITO_VAZIOS);
        }

        return quesitoRepository.update(identificadorQuesito, dadosAtualizacao);
    }
}

export default new UpdateQuesitoService();
