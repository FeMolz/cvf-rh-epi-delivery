import createCandidaturaService from '../services/CreateCandidaturaService.js';
import createCandidaturaAutenticadaService from '../services/CreateCandidaturaAutenticadaService.js';
import atualizarStatusCandidaturaService from '../services/AtualizarStatusCandidaturaService.js';
import downloadCurriculoCandidaturaService from '../services/DownloadCurriculoCandidaturaService.js';
import getCandidaturaService from '../services/GetCandidaturaService.js';
import listCandidaturasService from '../services/ListCandidaturasService.js';
import listTodasCandidaturasService from '../services/ListTodasCandidaturasService.js';
import marcarVisualizacaoCandidaturaService from '../services/MarcarVisualizacaoCandidaturaService.js';
import reativarCandidaturaService from '../services/ReativarCandidaturaService.js';
import { sanitizarNomeArquivoDownload } from '../utils/sanitizarNomeArquivoDownload.js';

class CandidaturaController {
    async createPublica(requisicao, resposta, proximo) {
        try {
            const candidaturaCriada = await createCandidaturaService.execute(
                requisicao.params.id,
                requisicao.body,
                requisicao.file
            );
            return resposta.status(201).json(candidaturaCriada);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async createAutenticada(requisicao, resposta, proximo) {
        try {
            const candidaturaCriada = await createCandidaturaAutenticadaService.execute(
                requisicao.params.id,
                requisicao.user.id,
                requisicao.body,
                requisicao.file
            );
            return resposta.status(201).json(candidaturaCriada);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async atualizarStatus(requisicao, resposta, proximo) {
        try {
            const candidaturaAtualizada = await atualizarStatusCandidaturaService.execute(
                requisicao.params.id,
                { status: requisicao.body.status }
            );
            return resposta.status(200).json(candidaturaAtualizada);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async marcarVisualizacao(requisicao, resposta, proximo) {
        try {
            const candidatura = await marcarVisualizacaoCandidaturaService.execute(
                requisicao.params.id,
                { tipo: requisicao.body?.tipo }
            );
            return resposta.status(200).json(candidatura);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async list(requisicao, resposta, proximo) {
        try {
            const resultado = await listTodasCandidaturasService.execute({
                anuncioVagaId: requisicao.query.anuncioVagaId,
                dataInicio: requisicao.query.dataInicio,
                dataFim: requisicao.query.dataFim,
                status: requisicao.query.status,
                incluirDescartadas: requisicao.query.incluirDescartadas,
                reativados: requisicao.query.reativados,
                ordenacao: requisicao.query.ordenacao
            });
            return resposta.status(200).json(resultado);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async listByAnuncio(requisicao, resposta, proximo) {
        try {
            const resultado = await listCandidaturasService.execute(requisicao.params.id, {
                dataInicio: requisicao.query.dataInicio,
                dataFim: requisicao.query.dataFim,
                status: requisicao.query.status,
                incluirDescartadas: requisicao.query.incluirDescartadas
            });
            return resposta.status(200).json(resultado);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async reativar(requisicao, resposta, proximo) {
        try {
            const resultado = await reativarCandidaturaService.execute(requisicao.params.id);
            return resposta.status(200).json(resultado);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async getById(requisicao, resposta, proximo) {
        try {
            const candidatura = await getCandidaturaService.execute(requisicao.params.id);
            return resposta.status(200).json(candidatura);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async downloadCurriculo(requisicao, resposta, proximo) {
        try {
            const { bufferCurriculo, nomeArquivo, tipoMime } =
                await downloadCurriculoCandidaturaService.execute(requisicao.params.id, {
                    identificadorUsuario: requisicao.user?.id,
                    papelUsuario: requisicao.user?.role
                });
            const nomeArquivoSeguro = sanitizarNomeArquivoDownload(nomeArquivo);

            resposta.setHeader('Content-Type', tipoMime);
            resposta.attachment(nomeArquivoSeguro);
            return resposta.send(bufferCurriculo);
        } catch (erro) {
            return proximo(erro);
        }
    }
}

export default new CandidaturaController();
