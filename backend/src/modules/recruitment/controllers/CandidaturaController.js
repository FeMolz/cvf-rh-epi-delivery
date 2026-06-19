import createCandidaturaService from '../services/CreateCandidaturaService.js';
import downloadCurriculoCandidaturaService from '../services/DownloadCurriculoCandidaturaService.js';
import getCandidaturaService from '../services/GetCandidaturaService.js';
import listCandidaturasService from '../services/ListCandidaturasService.js';
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

    async listByAnuncio(requisicao, resposta, proximo) {
        try {
            const resultado = await listCandidaturasService.execute(requisicao.params.id, {
                dataInicio: requisicao.query.dataInicio,
                dataFim: requisicao.query.dataFim
            });
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
