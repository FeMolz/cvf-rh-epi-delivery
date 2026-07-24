import {
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    ORDENACAO_CANDIDATURAS,
    STATUS_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';
import { validarPeriodoFiltroCandidaturas } from '../utils/validarPeriodoFiltroCandidaturas.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

class ListTodasCandidaturasService {
    /**
     * @param {{ anuncioVagaId?: string, dataInicio?: string, dataFim?: string, status?: string, incluirDescartadas?: string, ordenacao?: string }} filtros
     */
    async execute(filtros = {}) {
        const identificadorAnuncio =
            typeof filtros.anuncioVagaId === 'string' && filtros.anuncioVagaId.trim()
                ? filtros.anuncioVagaId.trim()
                : undefined;

        if (identificadorAnuncio) {
            const anuncio = await anuncioVagaRepository.findById(identificadorAnuncio);
            if (!anuncio) {
                lancarErroRecrutamento(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
            }
        }

        const periodo = validarPeriodoFiltroCandidaturas(filtros);
        const statusFiltro =
            typeof filtros.status === 'string' && filtros.status.trim()
                ? filtros.status.trim().toUpperCase()
                : undefined;

        if (statusFiltro && !Object.values(STATUS_CANDIDATURA).includes(statusFiltro)) {
            return {
                totalCandidaturas: 0,
                totalFiltrado: 0,
                candidaturas: []
            };
        }

        const incluirDescartadas = filtros.incluirDescartadas === 'true' || filtros.incluirDescartadas === true;
        const reativados = filtros.reativados === 'true' || filtros.reativados === true;
        const ordenacaoInformada =
            typeof filtros.ordenacao === 'string' ? filtros.ordenacao.trim().toUpperCase() : '';
        const ordenacao = Object.values(ORDENACAO_CANDIDATURAS).includes(ordenacaoInformada)
            ? ordenacaoInformada
            : ORDENACAO_CANDIDATURAS.RECENTES;

        const filtrosRepositorio = {
            ...periodo,
            anuncioVagaId: identificadorAnuncio,
            status: statusFiltro,
            incluirDescartadas: incluirDescartadas || statusFiltro === STATUS_CANDIDATURA.DESCARTADO,
            reativados,
            ordenacao,
            excluirReativadosSemVaga:
                !reativados && !incluirDescartadas && statusFiltro !== STATUS_CANDIDATURA.DESCARTADO,
            excluirComCadastroAtivo:
                reativados ||
                (!incluirDescartadas && statusFiltro !== STATUS_CANDIDATURA.DESCARTADO)
        };

        const candidaturas = await candidaturaRepository.findMany(filtrosRepositorio);
        const totalCandidaturas = await candidaturaRepository.count(
            reativados
                ? {
                      reativados: true,
                      anuncioVagaId: identificadorAnuncio,
                      excluirComCadastroAtivo: true
                  }
                : {
                      anuncioVagaId: identificadorAnuncio,
                      incluirDescartadas,
                      excluirReativadosSemVaga: filtrosRepositorio.excluirReativadosSemVaga,
                      excluirComCadastroAtivo: filtrosRepositorio.excluirComCadastroAtivo
                  }
        );

        return {
            totalCandidaturas,
            totalFiltrado: candidaturas.length,
            candidaturas
        };
    }
}

export default new ListTodasCandidaturasService();
