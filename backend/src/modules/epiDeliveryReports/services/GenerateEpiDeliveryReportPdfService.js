import { randomUUID } from 'node:crypto';

import epiDeliveryReportPdfProvider from '../../../shared/providers/EpiDeliveryReportPdfProvider/EpiDeliveryReportPdfProvider.js';
import supabaseStorageProvider from '../../../shared/providers/SupabaseStorageProvider/SupabaseStorageProvider.js';
import epiDeliveryRepository from '../../epiDeliveries/repositories/EpiDeliveryRepository.js';
import epiDeliveryReportRepository from '../repositories/EpiDeliveryReportRepository.js';
import {
    MENSAGEM_CAMPOS_OBRIGATORIOS_EMISSAO,
    MENSAGEM_FUNCIONARIO_NAO_ENCONTRADO,
    MENSAGEM_SEM_ENTREGAS_PERIODO_EMISSAO
} from '../constants/relatorioEntregaEpiConstantes.js';
import { construirIntervaloEntregaUtc, formatarPeriodoParaPdf } from '../utils/periodoRelatorioEntregaEpi.js';
import { montarEntregasTabelaRelatorio } from '../utils/montarEntregasTabelaRelatorio.js';

class GenerateEpiDeliveryReportPdfService {
    /**
     * @param {{ employeeId: string, periodoInicio: string, periodoFim: string, generatedByUserId: string }} parametrosEmissao
     */
    async execute(parametrosEmissao) {
        const { employeeId, periodoInicio, periodoFim, generatedByUserId } = parametrosEmissao;

        if (!employeeId || !periodoInicio || !periodoFim || !generatedByUserId) {
            throw new Error(MENSAGEM_CAMPOS_OBRIGATORIOS_EMISSAO);
        }

        const { limiteInicialEntrega, limiteFinalEntrega } = construirIntervaloEntregaUtc(periodoInicio, periodoFim);

        const contextoFuncionario = await epiDeliveryReportRepository.findEmployeeContextForReport(employeeId);

        if (!contextoFuncionario) {
            throw new Error(MENSAGEM_FUNCIONARIO_NAO_ENCONTRADO);
        }

        const entregasNoPeriodo = await epiDeliveryRepository.findDeliveriesByEmployeeIdAndDeliveryDateRange(
            employeeId,
            limiteInicialEntrega,
            limiteFinalEntrega
        );

        if (!entregasNoPeriodo.length) {
            throw new Error(MENSAGEM_SEM_ENTREGAS_PERIODO_EMISSAO);
        }

        const entregasTabela = montarEntregasTabelaRelatorio(entregasNoPeriodo);

        const textoPeriodoReferencia = formatarPeriodoParaPdf(limiteInicialEntrega, limiteFinalEntrega);

        const bufferPdf = await epiDeliveryReportPdfProvider.gerarBufferPdf({
            nomeFuncionario: contextoFuncionario.name,
            nomeCargo: contextoFuncionario.role.name,
            nomeEmpresa: contextoFuncionario.company.name,
            nomeSetor: contextoFuncionario.setor.nome,
            textoPeriodoReferencia,
            entregasTabela
        });

        const identificadorRelatorio = randomUUID();
        const bucketRelatorios = supabaseStorageProvider.obterBucketRelatoriosEpi();
        const pathPdf = supabaseStorageProvider.montarPathRelatorioEpi(employeeId, identificadorRelatorio);

        await supabaseStorageProvider.uploadArquivo({
            bucket: bucketRelatorios,
            path: pathPdf,
            buffer: bufferPdf
        });

        try {
            return await epiDeliveryReportRepository.createReport({
                id: identificadorRelatorio,
                employeeId,
                periodStartDate: limiteInicialEntrega,
                periodEndDate: limiteFinalEntrega,
                pdfStoragePath: pathPdf,
                pdfTamanhoBytes: bufferPdf.length,
                foiImpresso: false,
                foiEncaminhado: false,
                foiAssinado: false,
                generatedByUserId
            });
        } catch (erroPersistencia) {
            await supabaseStorageProvider.removerArquivo({
                bucket: bucketRelatorios,
                path: pathPdf
            });
            throw erroPersistencia;
        }
    }
}

export default new GenerateEpiDeliveryReportPdfService();
