import { baixarArquivoApi, requisicaoApi } from '../../../shared/api/clienteHttp.js';

const URL_BASE_API = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * Lista vagas ativas no portal público (sem autenticação).
 */
export function listarVagasPublicas() {
    return requisicaoApi('/recruitment/publico/vagas');
}

/**
 * @param {string} id
 */
export function obterVagaPublica(id) {
    return requisicaoApi(`/recruitment/publico/vagas/${id}`);
}

/**
 * @param {string} id
 * @param {FormData} formData
 */
export async function candidatarSePublico(id, formData) {
    const resposta = await fetch(`${URL_BASE_API}/recruitment/publico/vagas/${id}/candidaturas`, {
        method: 'POST',
        body: formData
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        const mensagem =
            typeof dados.error === 'string'
                ? dados.error
                : typeof dados.message === 'string'
                  ? dados.message
                  : 'Não foi possível enviar a candidatura.';

        const erro = new Error(mensagem);
        erro.statusCode = resposta.status;
        throw erro;
    }

    return dados;
}

/**
 * @param {string} token
 */
export function listarVagasAtivas(token) {
    return requisicaoApi('/recruitment/vagas/ativas', { token });
}

/**
 * @param {string} id
 * @param {string} token
 */
export function obterVagaAtiva(id, token) {
    return requisicaoApi(`/recruitment/vagas/ativas/${id}`, { token });
}

/**
 * @param {string} id
 * @param {FormData} formData
 * @param {string} token
 */
export async function candidatarSe(id, formData, token) {
    const resposta = await fetch(`${URL_BASE_API}/recruitment/vagas/${id}/candidaturas`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        const mensagem =
            typeof dados.error === 'string'
                ? dados.error
                : typeof dados.message === 'string'
                  ? dados.message
                  : 'Não foi possível enviar a candidatura.';

        const erro = new Error(mensagem);
        erro.statusCode = resposta.status;
        throw erro;
    }

    return dados;
}

/**
 * @param {string} token
 * @param {{ status?: string }} [filtros]
 */
export function listarVagasAdmin(token, filtros = {}) {
    const parametros = new URLSearchParams();

    if (filtros.status) {
        parametros.set('status', filtros.status);
    }

    const consulta = parametros.toString();
    const caminho = consulta ? `/recruitment/vagas?${consulta}` : '/recruitment/vagas';

    return requisicaoApi(caminho, { token });
}

/**
 * @param {string} id
 * @param {string} token
 */
export function obterVagaAdmin(id, token) {
    return requisicaoApi(`/recruitment/vagas/${id}`, { token });
}

/**
 * @param {object} dados
 * @param {string} token
 */
export function criarVaga(dados, token) {
    return requisicaoApi('/recruitment/vagas', {
        method: 'POST',
        body: dados,
        token
    });
}

/**
 * @param {string} id
 * @param {object} dados
 * @param {string} token
 */
export function atualizarVaga(id, dados, token) {
    return requisicaoApi(`/recruitment/vagas/${id}`, {
        method: 'PUT',
        body: dados,
        token
    });
}

/**
 * @param {string} id
 * @param {string} status
 * @param {string} token
 */
export function atualizarStatusVaga(id, status, token) {
    return requisicaoApi(`/recruitment/vagas/${id}/status`, {
        method: 'PATCH',
        body: { status },
        token
    });
}

/**
 * @param {string} token
 * @param {{ anuncioVagaId?: string, status?: string, incluirDescartadas?: boolean, reativados?: boolean, dataInicio?: string, dataFim?: string, ordenacao?: string }} [filtros]
 */
export function listarTodasCandidaturas(token, filtros = {}) {
    const parametros = new URLSearchParams();

    if (filtros.anuncioVagaId) {
        parametros.set('anuncioVagaId', filtros.anuncioVagaId);
    }

    if (filtros.status) {
        parametros.set('status', filtros.status);
    }

    if (filtros.incluirDescartadas) {
        parametros.set('incluirDescartadas', 'true');
    }

    if (filtros.reativados) {
        parametros.set('reativados', 'true');
    }

    if (filtros.dataInicio) {
        parametros.set('dataInicio', filtros.dataInicio);
    }

    if (filtros.dataFim) {
        parametros.set('dataFim', filtros.dataFim);
    }

    if (filtros.ordenacao) {
        parametros.set('ordenacao', filtros.ordenacao);
    }

    const consulta = parametros.toString();
    const caminho = consulta ? `/recruitment/candidaturas?${consulta}` : '/recruitment/candidaturas';

    return requisicaoApi(caminho, { token });
}

/**
 * @param {string} vagaId
 * @param {string} token
 * @param {{ status?: string, incluirDescartadas?: boolean }} [filtros]
 */
export function listarCandidaturas(vagaId, token, filtros = {}) {
    const parametros = new URLSearchParams();

    if (filtros.status) {
        parametros.set('status', filtros.status);
    }

    if (filtros.incluirDescartadas) {
        parametros.set('incluirDescartadas', 'true');
    }

    const consulta = parametros.toString();
    const caminho = consulta
        ? `/recruitment/vagas/${vagaId}/candidaturas?${consulta}`
        : `/recruitment/vagas/${vagaId}/candidaturas`;

    return requisicaoApi(caminho, { token });
}

/**
 * @param {string} candidaturaId
 * @param {string} status
 * @param {string} token
 */
export function atualizarStatusCandidatura(candidaturaId, status, token) {
    return requisicaoApi(`/recruitment/candidaturas/${candidaturaId}/status`, {
        method: 'PATCH',
        body: { status },
        token
    });
}

/**
 * @param {string} candidaturaId
 * @param {string} token
 */
export function reativarCandidatura(candidaturaId, token) {
    return requisicaoApi(`/recruitment/candidaturas/${candidaturaId}/reativar`, {
        method: 'POST',
        token
    });
}

/**
 * @param {string} candidaturaId
 * @param {'DESCRICAO' | 'CURRICULO'} tipo
 * @param {string} token
 */
export function marcarVisualizacaoCandidatura(candidaturaId, tipo, token) {
    return requisicaoApi(`/recruitment/candidaturas/${candidaturaId}/visualizacao`, {
        method: 'POST',
        body: { tipo },
        token
    });
}

/**
 * @param {string} candidaturaId
 * @param {string} token
 */
export function gerarConviteCadastro(candidaturaId, token) {
    return requisicaoApi(`/recruitment/candidaturas/${candidaturaId}/convite-cadastro`, {
        method: 'POST',
        token
    });
}

/**
 * @param {string} token
 * @param {{ status?: string, processoAprovacao?: boolean }} [filtros]
 */
export function listarCadastrosContratacao(token, filtros = {}) {
    const parametros = new URLSearchParams();

    if (filtros.status) {
        parametros.set('status', filtros.status);
    }

    if (filtros.processoAprovacao) {
        parametros.set('processoAprovacao', 'true');
    }

    const consulta = parametros.toString();
    const caminho = consulta
        ? `/recruitment/cadastros-contratacao?${consulta}`
        : '/recruitment/cadastros-contratacao';

    return requisicaoApi(caminho, { token });
}

/**
 * @param {string} id
 * @param {string} token
 */
export function obterCadastroContratacao(id, token) {
    return requisicaoApi(`/recruitment/cadastros-contratacao/${id}`, { token });
}

/**
 * @param {string} id
 * @param {string} token
 */
export function reenviarEmailConviteCadastro(id, token) {
    return requisicaoApi(`/recruitment/cadastros-contratacao/${id}/reenviar-email`, {
        method: 'POST',
        token
    });
}

/**
 * @param {string} id
 * @param {{ status: string, admissionDate?: string, valeTransporte?: boolean, valeAlimentacao?: boolean, planoSaude?: boolean }} dados
 * @param {string} token
 */
export function atualizarStatusCadastroContratacao(id, dados, token) {
    return requisicaoApi(`/recruitment/cadastros-contratacao/${id}/status`, {
        method: 'PATCH',
        body: dados,
        token
    });
}

/**
 * @param {string} tokenAcesso
 */
export function obterCadastroContratacaoPublico(tokenAcesso) {
    return requisicaoApi(`/recruitment/publico/cadastro-contratacao/${tokenAcesso}`);
}

/**
 * @param {string} tokenAcesso
 * @param {object} dados
 */
export function submeterCadastroContratacaoPublico(tokenAcesso, dados) {
    return requisicaoApi(`/recruitment/publico/cadastro-contratacao/${tokenAcesso}`, {
        method: 'POST',
        body: dados
    });
}

/**
 * @param {string} candidaturaId
 * @param {string} token
 */
export function baixarCurriculo(candidaturaId, token) {
    return baixarArquivoApi(`/recruitment/candidaturas/${candidaturaId}/curriculo`, {
        token,
        nomeArquivoPadrao: 'curriculo.pdf'
    });
}
