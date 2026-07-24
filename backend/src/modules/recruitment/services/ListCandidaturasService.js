import { MENSAGEM_ANUNCIO_NAO_ENCONTRADO, STATUS_CANDIDATURA } from '../constants/recrutamentoConstantes.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';
import { validarPeriodoFiltroCandidaturas } from '../utils/validarPeriodoFiltroCandidaturas.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

class ListCandidaturasService {
    /**
     * @param {string} identificadorAnuncio
     * @param {{ dataInicio?: string, dataFim?: string, status?: string, incluirDescartadas?: string }} filtros
     */
    async execute(identificadorAnuncio, filtros = {}) {
        const anuncio = await anuncioVagaRepository.findById(identificadorAnuncio);
        if (!anuncio) {
            lancarErroRecrutamento(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
        }

        const periodo = validarPeriodoFiltroCandidaturas(filtros);
        const statusFiltro =
            typeof filtros.status === 'string' && filtros.status.trim()
                ? filtros.status.trim().toUpperCase()
                : undefined;

        if (statusFiltro && !Object.values(STATUS_CANDIDATURA).includes(statusFiltro)) {
            return {
                anuncio: { id: anuncio.id, tituloVaga: anuncio.tituloVaga, status: anuncio.status },
                totalCandidaturas: 0,
                totalFiltrado: 0,
                candidaturas: []
            };
        }

        const incluirDescartadas = filtros.incluirDescartadas === 'true' || filtros.incluirDescartadas === true;

        const candidaturas = await candidaturaRepository.findManyByAnuncio(identificadorAnuncio, {
            ...periodo,
            status: statusFiltro,
            incluirDescartadas: incluirDescartadas || statusFiltro === STATUS_CANDIDATURA.DESCARTADO,
            excluirReativadosSemVaga:
                !incluirDescartadas && statusFiltro !== STATUS_CANDIDATURA.DESCARTADO,
            excluirComCadastroAtivo: !incluirDescartadas && statusFiltro !== STATUS_CANDIDATURA.DESCARTADO
        });
        const totalCandidaturas = await candidaturaRepository.countByAnuncio(identificadorAnuncio, {
            incluirDescartadas,
            excluirReativadosSemVaga:
                !incluirDescartadas && statusFiltro !== STATUS_CANDIDATURA.DESCARTADO,
            excluirComCadastroAtivo: !incluirDescartadas && statusFiltro !== STATUS_CANDIDATURA.DESCARTADO
        });

        return {
            anuncio: { id: anuncio.id, tituloVaga: anuncio.tituloVaga, status: anuncio.status },
            totalCandidaturas,
            totalFiltrado: candidaturas.length,
            candidaturas
        };
    }
}

export default new ListCandidaturasService();
