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

class EpiProvider {
    /**
     * Busca dados do EPI na API pública
     * @param {string|number} caNumber
     * @returns {Promise<Object|null>}
     */
    async getEpiByCa(caNumber) {
        const baseUrl = process.env.CAEPI_API_URL || 'http://localhost:8080';

        try {
            const response = await fetch(`${baseUrl}/CA/${caNumber}`);

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
}

export default new EpiProvider();
