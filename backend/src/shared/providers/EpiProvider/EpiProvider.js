import {
    MENSAGEM_CAEPI_BUSCA_POR_NOME_INDISPONIVEL,
    MENSAGEM_CAEPI_INDISPONIVEL,
    ROTA_BUSCA_CAEPI_POR_NOME
} from '../../constants/caepiConstantes.js';
import { validarNumeroCaEpi } from '../../utils/validarNumeroCaEpi.js';
import env from '../../../config/env.js';

/**
 * @param {unknown} valorBruto
 * @returns {boolean|null} verdadeiro/falso quando interpretável; null quando ausente ou não mapeado
 */
function normalizarIndicadorValidadeBooleano(valorBruto) {
    if (valorBruto === true || valorBruto === 1) {
        return true;
    }
    if (valorBruto === false || valorBruto === 0) {
        return false;
    }
    if (typeof valorBruto === 'string') {
        const rotuloNormalizado = valorBruto.trim().toUpperCase();
        if (['TRUE', 'VERDADEIRO', '1', 'SIM', 'S'].includes(rotuloNormalizado)) {
            return true;
        }
        if (['FALSE', 'FALSO', '0', 'NÃO', 'NAO', 'N'].includes(rotuloNormalizado)) {
            return false;
        }
    }
    return null;
}

/**
 * @param {unknown} situacao
 * @returns {boolean}
 */
function situacaoCadastralIndicaEpiInvalido(situacao) {
    if (!situacao || typeof situacao !== 'string') {
        return false;
    }
    const situacaoSemAcentos = situacao.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
    return (
        situacaoSemAcentos.includes('VENCIDO')
        || situacaoSemAcentos.includes('CANCELADO')
        || situacaoSemAcentos.includes('CASSADO')
        || situacaoSemAcentos.includes('SUSPENSO')
        || situacaoSemAcentos.includes('INVALIDO')
    );
}

/**
 * @param {Record<string, unknown>} corpoRespostaCadastroCa
 * @returns {boolean}
 */
function cadastroPossuiValidadeAtivaNoOrgao(corpoRespostaCadastroCa) {
    const indicadorValidade = normalizarIndicadorValidadeBooleano(corpoRespostaCadastroCa.Validade);
    const indicadorStatusValidade = normalizarIndicadorValidadeBooleano(
        corpoRespostaCadastroCa.StatusValidade
    );

    if (indicadorValidade === false || indicadorStatusValidade === false) {
        return false;
    }

    if (situacaoCadastralIndicaEpiInvalido(corpoRespostaCadastroCa.Situacao)) {
        return false;
    }

    return true;
}

/**
 * @param {Response} response
 */
async function interpretarRespostaBuscaPorNome(response) {
    if (response.status === 404) {
        let corpoResposta = null;

        try {
            corpoResposta = await response.json();
        } catch {
            corpoResposta = null;
        }

        if (corpoResposta?.detail === 'Not Found') {
            throw new Error(MENSAGEM_CAEPI_BUSCA_POR_NOME_INDISPONIVEL);
        }

        return [];
    }

    if (!response.ok) {
        throw new Error(`Erro na API externa: ${response.statusText}`);
    }

    const dados = await response.json();

    if (!Array.isArray(dados)) {
        return [];
    }

    return dados
        .map((item) => ({
            caNumber: String(item.caNumber || item.RegistroCA || '').trim(),
            name: String(item.name || item.NomeEquipamento || 'EPI Sem Nome').trim()
        }))
        .filter((item) => item.caNumber);
}

/**
 * @param {unknown} erro
 * @returns {boolean}
 */
function erroIndicaApiCaepiIndisponivel(erro) {
    if (!(erro instanceof Error)) {
        return false;
    }

    const mensagem = erro.message.toLowerCase();
    const codigoCausa = erro.cause && typeof erro.cause === 'object' && 'code' in erro.cause
        ? String(erro.cause.code)
        : '';

    return (
        mensagem.includes('fetch failed')
        || codigoCausa === 'ECONNREFUSED'
        || codigoCausa === 'ENOTFOUND'
    );
}

class EpiProvider {
    /**
     * Busca dados do EPI na API pública
     * @param {string|number} caNumber
     * @returns {Promise<Object|null>}
     */
    async getEpiByCa(caNumber) {
        const baseUrl = env.CAEPI_API_URL;
        const numeroCaValidado = validarNumeroCaEpi(caNumber);

        try {
            const response = await fetch(`${baseUrl}/CA/${numeroCaValidado}`);

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Erro na API externa: ${response.statusText}`);
            }

            const corpoRespostaCadastroCa = await response.json();

            let expirationDate;
            if (corpoRespostaCadastroCa.DataValidade) {
                const partesData = corpoRespostaCadastroCa.DataValidade.split('/');
                if (partesData.length === 3) {
                    expirationDate = new Date(`${partesData[2]}-${partesData[1]}-${partesData[0]}T00:00:00Z`);
                } else {
                    expirationDate = new Date(corpoRespostaCadastroCa.DataValidade);
                }
            } else {
                expirationDate = new Date();
            }

            const hasValidCaRegistration = cadastroPossuiValidadeAtivaNoOrgao(corpoRespostaCadastroCa);

            return {
                caNumber: String(corpoRespostaCadastroCa.RegistroCA || caNumber),
                name: corpoRespostaCadastroCa.NomeEquipamento || 'EPI Sem Nome',
                expirationDate,
                isActive: hasValidCaRegistration,
                hasValidCaRegistration,
                rawData: corpoRespostaCadastroCa
            };
        } catch (error) {
            console.error('[EpiProvider] Erro ao consultar a API baseCAEPI:', error.message);
            throw new Error('Erro interno ao tentar consultar o EPI.');
        }
    }

    /**
     * Busca EPIs na base pública por nome parecido (endpoint estendido da API baseCAEPI).
     * @param {string} termo
     * @returns {Promise<Array<{ caNumber: string, name: string }>>}
     */
    async buscarEpisPorNomeEquipamento(termo) {
        const termoNormalizado = String(termo || '').trim();

        if (!termoNormalizado) {
            return [];
        }

        const baseUrl = env.CAEPI_API_URL;

        try {
            const response = await fetch(
                `${baseUrl}${ROTA_BUSCA_CAEPI_POR_NOME}/${encodeURIComponent(termoNormalizado)}`
            );

            return await interpretarRespostaBuscaPorNome(response);
        } catch (error) {
            if (error instanceof Error && error.message === MENSAGEM_CAEPI_BUSCA_POR_NOME_INDISPONIVEL) {
                throw error;
            }

            if (erroIndicaApiCaepiIndisponivel(error)) {
                throw new Error(MENSAGEM_CAEPI_INDISPONIVEL);
            }

            console.error('[EpiProvider] Erro ao pesquisar EPI por nome:', error.message);
            throw new Error('Erro interno ao tentar consultar o EPI.');
        }
    }
}

export default new EpiProvider();
