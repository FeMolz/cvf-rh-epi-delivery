import { criarErroHttp } from '../../errors/criarErroHttp.js';
import {
    MENSAGEM_CREDENCIAIS_SECULLUM_NAO_CONFIGURADAS,
    MENSAGEM_ERRO_AUTENTICACAO_SECULLUM,
    TEMPO_CACHE_TOKEN_SEGUNDOS_PADRAO
} from './constants/secullumProviderConstantes.js';
import { codificarCorpoFormulario } from './utils/codificarCorpoFormulario.js';
import { obterConfiguracaoSecullum } from './utils/obterConfiguracaoSecullum.js';

class SecullumAutenticadorProvider {
    constructor() {
        /** @type {{ token: string, expiraEm: number }|null} */
        this.cacheToken = null;
    }

    limparCacheToken() {
        this.cacheToken = null;
    }

    /**
     * @returns {Promise<string>}
     */
    async obterTokenAcesso() {
        if (this.cacheToken && Date.now() < this.cacheToken.expiraEm) {
            return this.cacheToken.token;
        }

        const configuracao = obterConfiguracaoSecullum();

        if (!configuracao.usuario || !configuracao.senha || !configuracao.bancoId) {
            throw criarErroHttp(MENSAGEM_CREDENCIAIS_SECULLUM_NAO_CONFIGURADAS, 503);
        }

        const corpo = codificarCorpoFormulario({
            grant_type: 'password',
            username: configuracao.usuario,
            password: configuracao.senha,
            client_id: configuracao.clientId
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), configuracao.timeoutMs);

        try {
            const resposta = await fetch(`${configuracao.urlAutenticador}/Token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: corpo,
                signal: controller.signal
            });

            const conteudoTexto = await resposta.text();

            if (!resposta.ok) {
                throw criarErroHttp(MENSAGEM_ERRO_AUTENTICACAO_SECULLUM, 502);
            }

            const dados = JSON.parse(conteudoTexto);
            const token = dados.access_token;

            if (!token) {
                throw criarErroHttp(MENSAGEM_ERRO_AUTENTICACAO_SECULLUM, 502);
            }

            const segundosValidade = Number(dados.expires_in) || TEMPO_CACHE_TOKEN_SEGUNDOS_PADRAO;
            const margemSegundos = 60;

            this.cacheToken = {
                token,
                expiraEm: Date.now() + Math.max(segundosValidade - margemSegundos, 60) * 1000
            };

            return token;
        } catch (erro) {
            if (erro.statusCode) {
                throw erro;
            }

            throw criarErroHttp(MENSAGEM_ERRO_AUTENTICACAO_SECULLUM, 502);
        } finally {
            clearTimeout(timeoutId);
        }
    }
}

export default new SecullumAutenticadorProvider();
