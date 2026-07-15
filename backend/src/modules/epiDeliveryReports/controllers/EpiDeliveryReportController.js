import generateEpiDeliveryReportPdfService from '../services/GenerateEpiDeliveryReportPdfService.js';
import listEmployeesEligibleForReportEmissionService from '../services/ListEmployeesEligibleForReportEmissionService.js';
import listEmployeesWithReportHistoryService from '../services/ListEmployeesWithReportHistoryService.js';
import listEmployeeEpiDeliveryReportArchiveService from '../services/ListEmployeeEpiDeliveryReportArchiveService.js';
import listEpiDeliveryReportsService from '../services/ListEpiDeliveryReportsService.js';
import listPendingEpiDeliveryReportsService from '../services/ListPendingEpiDeliveryReportsService.js';
import previewEpiDeliveryReportService from '../services/PreviewEpiDeliveryReportService.js';
import resolveEpiDeliveryReportPdfFileService from '../services/ResolveEpiDeliveryReportPdfFileService.js';
import updateEpiDeliveryReportFlagsService from '../services/UpdateEpiDeliveryReportFlagsService.js';
import {
    MENSAGEM_ARQUIVO_PDF_AUSENTE,
    MENSAGEM_CAMPOS_OBRIGATORIOS_EMISSAO,
    MENSAGEM_ERRO_FORMATO_DATA,
    MENSAGEM_ERRO_PERIODO_INVALIDO,
    MENSAGEM_FLAGS_OBRIGATORIAS,
    MENSAGEM_FUNCIONARIO_NAO_ENCONTRADO,
    MENSAGEM_IDENTIFICADOR_FUNCIONARIO_OBRIGATORIO,
    MENSAGEM_IDENTIFICADOR_RELATORIO_OBRIGATORIO,
    MENSAGEM_RELATORIO_NAO_ENCONTRADO,
    MENSAGEM_SEM_ENTREGAS_PERIODO_EMISSAO
} from '../constants/relatorioEntregaEpiConstantes.js';

const CONJUNTO_MENSAGENS_RESPOSTA_400 = new Set([
    MENSAGEM_CAMPOS_OBRIGATORIOS_EMISSAO,
    MENSAGEM_ERRO_FORMATO_DATA,
    MENSAGEM_ERRO_PERIODO_INVALIDO,
    MENSAGEM_FUNCIONARIO_NAO_ENCONTRADO,
    MENSAGEM_SEM_ENTREGAS_PERIODO_EMISSAO,
    MENSAGEM_FLAGS_OBRIGATORIAS,
    MENSAGEM_IDENTIFICADOR_FUNCIONARIO_OBRIGATORIO,
    MENSAGEM_IDENTIFICADOR_RELATORIO_OBRIGATORIO
]);

const CONJUNTO_MENSAGENS_RESPOSTA_404 = new Set([
    MENSAGEM_RELATORIO_NAO_ENCONTRADO,
    MENSAGEM_ARQUIVO_PDF_AUSENTE
]);

class EpiDeliveryReportController {
    async create(req, res, next) {
        try {
            const { employeeId, periodoInicio, periodoFim } = req.body;
            const registroRelatorio = await generateEpiDeliveryReportPdfService.execute({
                employeeId,
                periodoInicio,
                periodoFim,
                generatedByUserId: req.user.id
            });
            return res.status(201).json(registroRelatorio);
        } catch (erro) {
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return res.status(400).json({ error: erro.message });
            }
            return next(erro);
        }
    }

    async list(req, res, next) {
        try {
            const resultado = await listEpiDeliveryReportsService.execute(req.query);
            return res.status(200).json(resultado);
        } catch (erro) {
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return res.status(400).json({ error: erro.message });
            }
            return next(erro);
        }
    }

    async preview(req, res, next) {
        try {
            const { employeeId, periodoInicio, periodoFim } = req.query;
            const previewRelatorio = await previewEpiDeliveryReportService.execute({
                employeeId,
                periodoInicio,
                periodoFim
            });
            return res.status(200).json(previewRelatorio);
        } catch (erro) {
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return res.status(400).json({ error: erro.message });
            }
            return next(erro);
        }
    }

    async listEmployeesEligibleForEmission(req, res, next) {
        try {
            const funcionarios = await listEmployeesEligibleForReportEmissionService.execute();
            return res.status(200).json(funcionarios);
        } catch (erro) {
            return next(erro);
        }
    }

    async listEmployeesWithReports(req, res, next) {
        try {
            const funcionarios = await listEmployeesWithReportHistoryService.execute();
            return res.status(200).json(funcionarios);
        } catch (erro) {
            return next(erro);
        }
    }

    async listPending(req, res, next) {
        try {
            const listaPendente = await listPendingEpiDeliveryReportsService.execute();
            return res.status(200).json(listaPendente);
        } catch (erro) {
            return next(erro);
        }
    }

    async listArchiveByEmployee(req, res, next) {
        try {
            const { employeeId } = req.params;
            const listaArquivo = await listEmployeeEpiDeliveryReportArchiveService.execute(employeeId);
            return res.status(200).json(listaArquivo);
        } catch (erro) {
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return res.status(400).json({ error: erro.message });
            }
            return next(erro);
        }
    }

    async updateFlags(req, res, next) {
        try {
            const { id } = req.params;
            const { foiImpresso, foiEncaminhado, foiAssinado } = req.body;
            const registroAtualizado = await updateEpiDeliveryReportFlagsService.execute(id, {
                foiImpresso,
                foiEncaminhado,
                foiAssinado
            });
            return res.status(200).json(registroAtualizado);
        } catch (erro) {
            if (erro.message === MENSAGEM_RELATORIO_NAO_ENCONTRADO) {
                return res.status(404).json({ error: erro.message });
            }
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return res.status(400).json({ error: erro.message });
            }
            return next(erro);
        }
    }

    async downloadPdf(req, res, next) {
        try {
            const { id } = req.params;
            const { bufferPdf, nomeArquivoSugerido } = await resolveEpiDeliveryReportPdfFileService.execute(id);
            res.setHeader('Content-Type', 'application/pdf');
            res.attachment(nomeArquivoSugerido);
            return res.send(bufferPdf);
        } catch (erro) {
            if (CONJUNTO_MENSAGENS_RESPOSTA_404.has(erro.message)) {
                return res.status(404).json({ error: erro.message });
            }
            return next(erro);
        }
    }
}

export default new EpiDeliveryReportController();
