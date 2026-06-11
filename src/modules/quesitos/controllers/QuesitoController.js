import createQuesitoService from '../services/CreateQuesitoService.js';
import listAllQuesitosService from '../services/ListAllQuesitosService.js';
import listQuesitosService from '../services/ListQuesitosService.js';
import updateQuesitoService from '../services/UpdateQuesitoService.js';
import deleteQuesitoService from '../services/DeleteQuesitoService.js';
import {
    MENSAGEM_BLOCO_QUESITO_OBRIGATORIO,
    MENSAGEM_CAMPOS_ATUALIZACAO_QUESITO_VAZIOS,
    MENSAGEM_DESCRICAO_QUESITO_OBRIGATORIA,
    MENSAGEM_FILTROS_NOME_E_BLOCO_EXCLUSIVOS,
    MENSAGEM_NOME_QUESITO_JA_CADASTRADO,
    MENSAGEM_NOME_QUESITO_OBRIGATORIO,
    MENSAGEM_QUESITO_NAO_ENCONTRADO
} from '../constants/quesitoConstantes.js';

const CONJUNTO_MENSAGENS_RESPOSTA_400 = new Set([
    MENSAGEM_NOME_QUESITO_OBRIGATORIO,
    MENSAGEM_DESCRICAO_QUESITO_OBRIGATORIA,
    MENSAGEM_BLOCO_QUESITO_OBRIGATORIO,
    MENSAGEM_NOME_QUESITO_JA_CADASTRADO,
    MENSAGEM_FILTROS_NOME_E_BLOCO_EXCLUSIVOS,
    MENSAGEM_CAMPOS_ATUALIZACAO_QUESITO_VAZIOS
]);

class QuesitoController {
    async create(req, res, next) {
        try {
            const { nome, descricao, bloco } = req.body;
            const quesitoCriado = await createQuesitoService.execute({ nome, descricao, bloco });

            return res.status(201).json(quesitoCriado);

        } catch (erro) {
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return res.status(400).json({ error: erro.message });
            }
            return next(erro);
        }
    }

    async listAll(request, response, next) {
        try {
            const listaQuesitos = await listAllQuesitosService.execute();
            return response.status(200).json(listaQuesitos);
        } catch (erro) {
            return next(erro);
        }
    }

    async update(request, response, next) {
        try {
            const { id } = request.params;
            const corpoRequisicao =
                request.body !== null && typeof request.body === 'object' ? request.body : {};
            const quesitoAtualizado = await updateQuesitoService.execute(id, corpoRequisicao);
            return response.status(200).json(quesitoAtualizado);
        } catch (erro) {
            if (erro.message === MENSAGEM_QUESITO_NAO_ENCONTRADO) {
                return response.status(404).json({ error: erro.message });
            }
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return response.status(400).json({ error: erro.message });
            }
            return next(erro);
        }
    }

    async delete(request, response, next) {
        try {
            const quesitoExcluido = await deleteQuesitoService.execute(request.params.id);
            return response.status(200).json(quesitoExcluido);
        } catch (erro) {
            if (erro.statusCode === 404) {
                return response.status(404).json({ error: erro.message });
            }
            return next(erro);
        }
    }

    async list(req, res, next) {
        try {
            const listaQuesitos = await listQuesitosService.execute({
                nomeFiltro: req.query.nome,
                blocoFiltro: req.query.bloco
            });
            return res.status(200).json(listaQuesitos);
        } catch (erro) {
            if (erro.message === MENSAGEM_QUESITO_NAO_ENCONTRADO) {
                return res.status(404).json({ error: erro.message });

            }
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return res.status(400).json({ error: erro.message });
            }
            
            return next(erro);
        }
    }
}

export default new QuesitoController();
