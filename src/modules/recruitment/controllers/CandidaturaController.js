import createCandidaturaService from '../services/CreateCandidaturaService.js';
import downloadCurriculoCandidaturaService from '../services/DownloadCurriculoCandidaturaService.js';
import getCandidaturaService from '../services/GetCandidaturaService.js';
import listCandidaturasService from '../services/ListCandidaturasService.js';
import { sanitizarNomeArquivoDownload } from '../utils/sanitizarNomeArquivoDownload.js';
import {
    registrarEventoAuditoria,
    TIPOS_EVENTO_AUDITORIA
} from '../../../shared/utils/registrarEventoAuditoria.js';
import {
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_CIDADE_OBRIGATORIA,
    MENSAGEM_CURRICULO_AUSENTE,
    MENSAGEM_CURRICULO_OBRIGATORIO,
    MENSAGEM_CURRICULO_TAMANHO_EXCEDIDO,
    MENSAGEM_CURRICULO_TIPO_NAO_PERMITIDO,
    MENSAGEM_DATA_FIM_INVALIDA,
    MENSAGEM_DATA_INICIO_INVALIDA,
    MENSAGEM_EMAIL_INVALIDO,
    MENSAGEM_EMAIL_OBRIGATORIO,
    MENSAGEM_ESTADO_OBRIGATORIO,
    MENSAGEM_NOME_COMPLETO_OBRIGATORIO,
    MENSAGEM_PERIODO_FILTRO_INVALIDO,
    MENSAGEM_TELEFONE_OBRIGATORIO
} from '../constants/recrutamentoConstantes.js';

const CONJUNTO_MENSAGENS_RESPOSTA_400 = new Set([
    MENSAGEM_NOME_COMPLETO_OBRIGATORIO,
    MENSAGEM_EMAIL_OBRIGATORIO,
    MENSAGEM_EMAIL_INVALIDO,
    MENSAGEM_TELEFONE_OBRIGATORIO,
    MENSAGEM_CIDADE_OBRIGATORIA,
    MENSAGEM_ESTADO_OBRIGATORIO,
    MENSAGEM_CURRICULO_OBRIGATORIO,
    MENSAGEM_CURRICULO_TIPO_NAO_PERMITIDO,
    MENSAGEM_CURRICULO_TAMANHO_EXCEDIDO,
    MENSAGEM_DATA_INICIO_INVALIDA,
    MENSAGEM_DATA_FIM_INVALIDA,
    MENSAGEM_PERIODO_FILTRO_INVALIDO
]);

const CONJUNTO_MENSAGENS_RESPOSTA_404 = new Set([
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_CURRICULO_AUSENTE
]);

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
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return resposta.status(400).json({ error: erro.message });
            }
            if (CONJUNTO_MENSAGENS_RESPOSTA_404.has(erro.message)) {
                return resposta.status(404).json({ error: erro.message });
            }
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
            if (erro.message === MENSAGEM_ANUNCIO_NAO_ENCONTRADO) {
                return resposta.status(404).json({ error: erro.message });
            }
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return resposta.status(400).json({ error: erro.message });
            }
            return proximo(erro);
        }
    }

    async getById(requisicao, resposta, proximo) {
        try {
            const candidatura = await getCandidaturaService.execute(requisicao.params.id);
            return resposta.status(200).json(candidatura);
        } catch (erro) {
            if (erro.message === MENSAGEM_CANDIDATURA_NAO_ENCONTRADA) {
                return resposta.status(404).json({ error: erro.message });
            }
            return proximo(erro);
        }
    }

    async downloadCurriculo(requisicao, resposta, proximo) {
        try {
            const { bufferCurriculo, nomeArquivo, tipoMime } =
                await downloadCurriculoCandidaturaService.execute(requisicao.params.id);
            const nomeArquivoSeguro = sanitizarNomeArquivoDownload(nomeArquivo);

            registrarEventoAuditoria(TIPOS_EVENTO_AUDITORIA.DOWNLOAD_CURRICULO, {
                identificadorCandidatura: requisicao.params.id,
                identificadorUsuario: requisicao.user?.id,
                papelUsuario: requisicao.user?.role
            });

            resposta.setHeader('Content-Type', tipoMime);
            resposta.attachment(nomeArquivoSeguro);
            return resposta.send(bufferCurriculo);
        } catch (erro) {
            if (CONJUNTO_MENSAGENS_RESPOSTA_404.has(erro.message)) {
                return resposta.status(404).json({ error: erro.message });
            }
            return proximo(erro);
        }
    }
}

export default new CandidaturaController();
