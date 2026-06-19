import { criarErroHttp } from '../../errors/criarErroHttp.js';
import {
    MENSAGEM_BANCO_SECULLUM_NAO_AUTORIZADO,
    MENSAGEM_ERRO_CONSULTA_BATIDAS_SECULLUM
} from './constants/secullumProviderConstantes.js';
import secullumAutenticadorProvider from './SecullumAutenticadorProvider.js';
import { normalizarListaBatidasSecullum } from './utils/normalizarBatidaSecullum.js';
import { obterConfiguracaoSecullum } from './utils/obterConfiguracaoSecullum.js';

/**
 * @typedef {Object} FiltroBatidasSecullum
 * @property {string} dataInicio
 * @property {string} dataFim
 * @property {string} [funcionarioCpf]
 * @property {string} [funcionarioPis]
 * @property {string} [empresaDocumento]
 * @property {string} [horaInicio]
 * @property {string} [horaFim]
 */

class SecullumBatidasProvider {
    /**
     * @param {FiltroBatidasSecullum} filtro
     */
    montarQueryBatidas(filtro) {
        const parametros = new URLSearchParams();
        parametros.set('DataInicio', filtro.dataInicio);
        parametros.set('DataFim', filtro.dataFim);

        if (filtro.funcionarioCpf) {
            parametros.set('FuncionarioCpf', filtro.funcionarioCpf);
        }

        if (filtro.funcionarioPis) {
            parametros.set('FuncionarioPis', filtro.funcionarioPis);
        }

        if (filtro.empresaDocumento) {
            parametros.set('EmpresaDocumento', filtro.empresaDocumento);
        }

        if (filtro.horaInicio) {
            parametros.set('HoraInicio', filtro.horaInicio);
        }

        if (filtro.horaFim) {
            parametros.set('HoraFim', filtro.horaFim);
        }

        return parametros.toString();
    }

    /**
     * @param {FiltroBatidasSecullum} filtro
     */
    async listarBatidas(filtro) {
        const configuracao = obterConfiguracaoSecullum();
        const token = await secullumAutenticadorProvider.obterTokenAcesso();
        const query = this.montarQueryBatidas(filtro);
        const urlBase = configuracao.urlApiIntegracao.replace(/\/$/, '');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), configuracao.timeoutMs);

        try {
            const resposta = await fetch(`${urlBase}/Batidas?${query}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept-Language': 'pt-BR',
                    secullumidbancoselecionado: configuracao.bancoId
                },
                signal: controller.signal
            });

            const conteudoTexto = await resposta.text();

            if (resposta.status === 401) {
                secullumAutenticadorProvider.limparCacheToken();
                throw criarErroHttp(MENSAGEM_BANCO_SECULLUM_NAO_AUTORIZADO, 502);
            }

            if (!resposta.ok) {
                throw criarErroHttp(MENSAGEM_ERRO_CONSULTA_BATIDAS_SECULLUM, 502);
            }

            if (!conteudoTexto) {
                return [];
            }

            const dados = JSON.parse(conteudoTexto);
            return normalizarListaBatidasSecullum(dados);
        } catch (erro) {
            if (erro.statusCode) {
                throw erro;
            }

            throw criarErroHttp(MENSAGEM_ERRO_CONSULTA_BATIDAS_SECULLUM, 502);
        } finally {
            clearTimeout(timeoutId);
        }
    }
}

export default new SecullumBatidasProvider();
