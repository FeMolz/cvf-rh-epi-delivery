import {
    DIAS_JANELA_ULTIMAS_EMISSOES_RELATORIO,
    LIMITE_MAXIMO_LISTAGEM_RELATORIOS,
    LIMITE_PADRAO_LISTAGEM_RELATORIOS,
    MENSAGEM_ERRO_FORMATO_DATA,
    PAGINA_PADRAO_LISTAGEM_RELATORIOS
} from '../constants/relatorioEntregaEpiConstantes.js';
import epiDeliveryReportRepository from '../repositories/EpiDeliveryReportRepository.js';
import { construirIntervaloEntregaUtc } from '../utils/periodoRelatorioEntregaEpi.js';

/**
 * @param {unknown} valor
 * @returns {boolean|undefined}
 */
function interpretarBooleanoConsulta(valor) {
    if (valor === undefined || valor === null || valor === '') {
        return undefined;
    }

    const texto = String(valor).trim().toLowerCase();

    if (texto === 'true' || texto === '1') {
        return true;
    }

    if (texto === 'false' || texto === '0') {
        return false;
    }

    return undefined;
}

/**
 * @param {unknown} valor
 * @param {number} padrao
 * @param {number} maximo
 */
function interpretarInteiroPositivo(valor, padrao, maximo) {
    const numero = Number(valor);

    if (!Number.isFinite(numero) || numero < 1) {
        return padrao;
    }

    return Math.min(Math.floor(numero), maximo);
}

class ListEpiDeliveryReportsService {
    /**
     * @param {{
     *   employeeId?: string,
     *   foiAssinado?: string,
     *   emissaoInicio?: string,
     *   emissaoFim?: string,
     *   ultimosDias?: string,
     *   pagina?: string,
     *   limite?: string
     * }} consulta
     */
    async execute(consulta = {}) {
        const employeeId = consulta.employeeId ? String(consulta.employeeId).trim() : undefined;
        const foiAssinado = interpretarBooleanoConsulta(consulta.foiAssinado);
        const pagina = interpretarInteiroPositivo(
            consulta.pagina,
            PAGINA_PADRAO_LISTAGEM_RELATORIOS,
            Number.MAX_SAFE_INTEGER
        );
        const limite = interpretarInteiroPositivo(
            consulta.limite,
            LIMITE_PADRAO_LISTAGEM_RELATORIOS,
            LIMITE_MAXIMO_LISTAGEM_RELATORIOS
        );

        let emissaoInicio;
        let emissaoFim;
        let ultimosDias;

        if (consulta.ultimosDias !== undefined && consulta.ultimosDias !== null && consulta.ultimosDias !== '') {
            ultimosDias = interpretarInteiroPositivo(
                consulta.ultimosDias,
                DIAS_JANELA_ULTIMAS_EMISSOES_RELATORIO,
                DIAS_JANELA_ULTIMAS_EMISSOES_RELATORIO
            );
        }

        if (consulta.emissaoInicio || consulta.emissaoFim) {
            if (!consulta.emissaoInicio || !consulta.emissaoFim) {
                throw new Error(MENSAGEM_ERRO_FORMATO_DATA);
            }

            const intervalo = construirIntervaloEntregaUtc(
                String(consulta.emissaoInicio),
                String(consulta.emissaoFim)
            );

            emissaoInicio = intervalo.limiteInicialEntrega;
            emissaoFim = intervalo.limiteFinalEntrega;
        }

        return epiDeliveryReportRepository.findManyComFiltros({
            employeeId: employeeId || undefined,
            foiAssinado,
            emissaoInicio,
            emissaoFim,
            ultimosDias,
            pagina,
            limite
        });
    }
}

export default new ListEpiDeliveryReportsService();
