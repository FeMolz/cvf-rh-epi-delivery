import createAnuncioVagaService from '../services/CreateAnuncioVagaService.js';
import getAnuncioVagaService from '../services/GetAnuncioVagaService.js';
import getAnuncioVagaPublicoService from '../services/GetAnuncioVagaPublicoService.js';
import listAnunciosVagaService from '../services/ListAnunciosVagaService.js';
import updateAnuncioVagaService from '../services/UpdateAnuncioVagaService.js';
import updateStatusAnuncioVagaService from '../services/UpdateStatusAnuncioVagaService.js';
import {
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_APRESENTACAO_EMPRESA_OBRIGATORIA,
    MENSAGEM_BENEFICIOS_OBRIGATORIOS,
    MENSAGEM_CAMPOS_ATUALIZACAO_ANUNCIO_VAZIOS,
    MENSAGEM_JORNADA_TRABALHO_OBRIGATORIA,
    MENSAGEM_LOCAL_TRABALHO_OBRIGATORIO,
    MENSAGEM_REQUISITOS_OBRIGATORIOS,
    MENSAGEM_RESPONSABILIDADES_OBRIGATORIAS,
    MENSAGEM_SOBRE_VAGA_OBRIGATORIA,
    MENSAGEM_STATUS_ANUNCIO_INVALIDO,
    MENSAGEM_TIPO_CONTRATACAO_INVALIDO,
    MENSAGEM_TITULO_VAGA_OBRIGATORIO,
    MENSAGEM_ROLE_ID_OBRIGATORIO,
    MENSAGEM_COMPANY_ID_OBRIGATORIO,
    MENSAGEM_SETOR_ID_OBRIGATORIO
} from '../constants/recrutamentoConstantes.js';

const CONJUNTO_MENSAGENS_RESPOSTA_400 = new Set([
    MENSAGEM_TITULO_VAGA_OBRIGATORIO,
    MENSAGEM_APRESENTACAO_EMPRESA_OBRIGATORIA,
    MENSAGEM_SOBRE_VAGA_OBRIGATORIA,
    MENSAGEM_RESPONSABILIDADES_OBRIGATORIAS,
    MENSAGEM_REQUISITOS_OBRIGATORIOS,
    MENSAGEM_BENEFICIOS_OBRIGATORIOS,
    MENSAGEM_LOCAL_TRABALHO_OBRIGATORIO,
    MENSAGEM_TIPO_CONTRATACAO_INVALIDO,
    MENSAGEM_JORNADA_TRABALHO_OBRIGATORIA,
    MENSAGEM_CAMPOS_ATUALIZACAO_ANUNCIO_VAZIOS,
    MENSAGEM_STATUS_ANUNCIO_INVALIDO,
    MENSAGEM_ROLE_ID_OBRIGATORIO,
    MENSAGEM_COMPANY_ID_OBRIGATORIO,
    MENSAGEM_SETOR_ID_OBRIGATORIO
]);

const CONJUNTO_MENSAGENS_RESPOSTA_404 = new Set([
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_ANUNCIO_NAO_ATIVO
]);

class AnuncioVagaController {
    async create(requisicao, resposta, proximo) {
        try {
            const anuncioCriado = await createAnuncioVagaService.execute({
                ...requisicao.body,
                criadoPorUserId: requisicao.user.id
            });
            return resposta.status(201).json(anuncioCriado);
        } catch (erro) {
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return resposta.status(400).json({ error: erro.message });
            }
            return proximo(erro);
        }
    }

    async list(requisicao, resposta, proximo) {
        try {
            const listaAnuncios = await listAnunciosVagaService.execute({
                status: requisicao.query.status
            });
            return resposta.status(200).json(listaAnuncios);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async getById(requisicao, resposta, proximo) {
        try {
            const anuncio = await getAnuncioVagaService.execute(requisicao.params.id);
            return resposta.status(200).json(anuncio);
        } catch (erro) {
            if (erro.message === MENSAGEM_ANUNCIO_NAO_ENCONTRADO) {
                return resposta.status(404).json({ error: erro.message });
            }
            return proximo(erro);
        }
    }

    async getPublico(requisicao, resposta, proximo) {
        try {
            const anuncio = await getAnuncioVagaPublicoService.execute(requisicao.params.id);
            return resposta.status(200).json(anuncio);
        } catch (erro) {
            if (CONJUNTO_MENSAGENS_RESPOSTA_404.has(erro.message)) {
                return resposta.status(404).json({ error: erro.message });
            }
            return proximo(erro);
        }
    }

    async update(requisicao, resposta, proximo) {
        try {
            const corpoRequisicao =
                requisicao.body !== null && typeof requisicao.body === 'object' ? requisicao.body : {};
            const anuncioAtualizado = await updateAnuncioVagaService.execute(
                requisicao.params.id,
                corpoRequisicao
            );
            return resposta.status(200).json(anuncioAtualizado);
        } catch (erro) {
            if (erro.message === MENSAGEM_ANUNCIO_NAO_ENCONTRADO) {
                return resposta.status(404).json({ error: erro.message });
            }
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return resposta.status(400).json({ error: erro.message });
            }
            return proximo(erro);
        }
    }

    async updateStatus(requisicao, resposta, proximo) {
        try {
            const anuncioAtualizado = await updateStatusAnuncioVagaService.execute(requisicao.params.id, {
                status: requisicao.body.status
            });
            return resposta.status(200).json(anuncioAtualizado);
        } catch (erro) {
            if (erro.message === MENSAGEM_ANUNCIO_NAO_ENCONTRADO) {
                return resposta.status(404).json({ error: erro.message });
            }
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return resposta.status(400).json({ error: erro.message });
            }
            return proximo(erro);
        }
    }
}

export default new AnuncioVagaController();
