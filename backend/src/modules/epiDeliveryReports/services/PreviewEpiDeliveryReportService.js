import epiDeliveryRepository from '../../epiDeliveries/repositories/EpiDeliveryRepository.js';
import epiDeliveryReportRepository from '../repositories/EpiDeliveryReportRepository.js';
import {
    MENSAGEM_CAMPOS_OBRIGATORIOS_EMISSAO,
    MENSAGEM_FUNCIONARIO_NAO_ENCONTRADO
} from '../constants/relatorioEntregaEpiConstantes.js';
import { montarEntregasTabelaRelatorio } from '../utils/montarEntregasTabelaRelatorio.js';
import { construirIntervaloEntregaUtc, formatarPeriodoParaPdf } from '../utils/periodoRelatorioEntregaEpi.js';

class PreviewEpiDeliveryReportService {
    /**
     * @param {{ employeeId: string, periodoInicio: string, periodoFim: string }} parametrosPreview
     */
    async execute(parametrosPreview) {
        const { employeeId, periodoInicio, periodoFim } = parametrosPreview;

        if (!employeeId || !periodoInicio || !periodoFim) {
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

        return {
            employee: {
                id: contextoFuncionario.id,
                name: contextoFuncionario.name,
                roleName: contextoFuncionario.role?.name || '—',
                companyName: contextoFuncionario.company?.name || '—',
                setorName: contextoFuncionario.setor?.nome || '—'
            },
            textoPeriodoReferencia: formatarPeriodoParaPdf(limiteInicialEntrega, limiteFinalEntrega),
            entregas: montarEntregasTabelaRelatorio(entregasNoPeriodo)
        };
    }
}

export default new PreviewEpiDeliveryReportService();
