import createQuesitoService from '../services/CreateQuesitoService.js';
import listQuesitosService from '../services/ListQuesitosService.js';
import {
    MENSAGEM_FILTROS_NOME_E_BLOCO_EXCLUSIVOS,
    MENSAGEM_NOME_QUESITO_JA_CADASTRADO,
    MENSAGEM_NOME_QUESITO_OBRIGATORIO,
    MENSAGEM_DESCRICAO_QUESITO_OBRIGATORIA,
    MENSAGEM_BLOCO_QUESITO_OBRIGATORIO,
    MENSAGEM_QUESITO_NAO_ENCONTRADO
} from '../constants/quesitoConstantes.js';

const CONJUNTO_MENSAGENS_RESPOSTA_400 = new Set([
    MENSAGEM_NOME_QUESITO_OBRIGATORIO,
    MENSAGEM_DESCRICAO_QUESITO_OBRIGATORIA,
    MENSAGEM_BLOCO_QUESITO_OBRIGATORIO,
    MENSAGEM_NOME_QUESITO_JA_CADASTRADO,
    MENSAGEM_FILTROS_NOME_E_BLOCO_EXCLUSIVOS
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
