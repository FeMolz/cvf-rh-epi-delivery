import createAnuncioVagaService from '../services/CreateAnuncioVagaService.js';
import getAnuncioVagaService from '../services/GetAnuncioVagaService.js';
import getAnuncioVagaAtivoService from '../services/GetAnuncioVagaAtivoService.js';
import getAnuncioVagaPublicoService from '../services/GetAnuncioVagaPublicoService.js';
import listAnunciosVagaService from '../services/ListAnunciosVagaService.js';
import listAnunciosVagaAtivosService from '../services/ListAnunciosVagaAtivosService.js';
import updateAnuncioVagaService from '../services/UpdateAnuncioVagaService.js';
import updateStatusAnuncioVagaService from '../services/UpdateStatusAnuncioVagaService.js';

class AnuncioVagaController {
    async create(requisicao, resposta, proximo) {
        try {
            const anuncioCriado = await createAnuncioVagaService.execute({
                ...requisicao.body,
                criadoPorUserId: requisicao.user.id
            });
            return resposta.status(201).json(anuncioCriado);
        } catch (erro) {
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
            return proximo(erro);
        }
    }

    async getPublico(requisicao, resposta, proximo) {
        try {
            const anuncio = await getAnuncioVagaPublicoService.execute(requisicao.params.id);
            return resposta.status(200).json(anuncio);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async listPublico(requisicao, resposta, proximo) {
        try {
            const listaAnuncios = await listAnunciosVagaAtivosService.execute();
            const listaPublica = listaAnuncios.map((anuncio) => {
                const anuncioPublico = { ...anuncio };
                delete anuncioPublico.criadoPor;
                delete anuncioPublico.criadoPorUserId;
                return anuncioPublico;
            });
            return resposta.status(200).json(listaPublica);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async listAtivos(requisicao, resposta, proximo) {
        try {
            const listaAnuncios = await listAnunciosVagaAtivosService.execute();
            return resposta.status(200).json(listaAnuncios);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async getAtivo(requisicao, resposta, proximo) {
        try {
            const anuncio = await getAnuncioVagaAtivoService.execute(
                requisicao.params.id,
                requisicao.user?.id
            );
            return resposta.status(200).json(anuncio);
        } catch (erro) {
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
            return proximo(erro);
        }
    }
}

export default new AnuncioVagaController();
