import {
    ROTULOS_MODO_TRABALHO,
    ROTULOS_STATUS_CANDIDATURA,
    ROTULOS_TIPO_CONTRATACAO,
    STATUS_ANUNCIO_VAGA
} from '../constants/recrutamentoConstantes.js';

/**
 * @param {string} status
 */
export function obterRotuloStatusCandidatura(status) {
    return ROTULOS_STATUS_CANDIDATURA[status] || status;
}

/**
 * @param {string} modo
 */
export function obterRotuloModoTrabalho(modo) {
    return ROTULOS_MODO_TRABALHO[modo] || modo;
}

/**
 * @param {string} tipo
 */
export function obterRotuloTipoContratacao(tipo) {
    return ROTULOS_TIPO_CONTRATACAO[tipo] || tipo;
}

/**
 * @param {string} status
 */
export function obterRotuloStatusVaga(status) {
    if (status === STATUS_ANUNCIO_VAGA.INATIVA) {
        return 'Rascunho';
    }

    if (status === STATUS_ANUNCIO_VAGA.ATIVA) {
        return 'Ativa';
    }

    if (status === STATUS_ANUNCIO_VAGA.ENCERRADA) {
        return 'Encerrada';
    }

    return status;
}

/**
 * @param {string} status
 */
export function obterClasseStatusVaga(status) {
    if (status === STATUS_ANUNCIO_VAGA.ATIVA) {
        return 'status-badge status-badge--ativo';
    }

    if (status === STATUS_ANUNCIO_VAGA.ENCERRADA) {
        return 'status-badge status-badge--encerrado';
    }

    return 'status-badge status-badge--offline';
}

/**
 * @param {Array<{ tituloVaga?: string, localTrabalho?: string }>} vagas
 * @param {string} termo
 */
export function filtrarVagasPorTermo(vagas, termo) {
    const termoNormalizado = termo.trim().toLowerCase();

    if (!termoNormalizado) {
        return vagas;
    }

    return vagas.filter((vaga) => {
        const titulo = (vaga.tituloVaga || '').toLowerCase();
        const local = (vaga.localTrabalho || '').toLowerCase();

        return titulo.includes(termoNormalizado) || local.includes(termoNormalizado);
    });
}

/**
 * @param {Array<{
 *   tituloVaga?: string,
 *   localTrabalho?: string,
 *   modoTrabalho?: string,
 *   tipoContratacao?: string
 * }>} vagas
 * @param {{
 *   termo?: string,
 *   modoTrabalho?: string,
 *   tipoContratacao?: string,
 *   localTrabalho?: string
 * }} filtros
 */
export function filtrarVagasPublicas(vagas, filtros = {}) {
    const listaBase = filtrarVagasPorTermo(vagas, filtros.termo || '');
    const modo = (filtros.modoTrabalho || '').trim();
    const tipo = (filtros.tipoContratacao || '').trim();
    const local = (filtros.localTrabalho || '').trim().toLowerCase();

    return listaBase.filter((vaga) => {
        if (modo && vaga.modoTrabalho !== modo) {
            return false;
        }

        if (tipo && vaga.tipoContratacao !== tipo) {
            return false;
        }

        if (local && (vaga.localTrabalho || '').toLowerCase() !== local) {
            return false;
        }

        return true;
    });
}

/**
 * @param {Array<{ localTrabalho?: string }>} vagas
 */
export function listarLocaisTrabalhoUnicos(vagas) {
    const locais = new Set();

    for (const vaga of vagas) {
        const local = typeof vaga.localTrabalho === 'string' ? vaga.localTrabalho.trim() : '';
        if (local) {
            locais.add(local);
        }
    }

    return [...locais].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
