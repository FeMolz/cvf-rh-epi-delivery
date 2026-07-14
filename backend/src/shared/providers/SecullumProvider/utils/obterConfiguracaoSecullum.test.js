import { describe, expect, it, afterEach } from '@jest/globals';

import {
    CLIENT_ID_PADRAO_PONTO_WEB,
    TIMEOUT_REQUISICAO_MS_PADRAO,
    URL_PADRAO_API_INTEGRACAO_SECULLUM,
    URL_PADRAO_AUTENTICADOR_SECULLUM
} from '../constants/secullumProviderConstantes.js';
import { obterConfiguracaoSecullum } from './obterConfiguracaoSecullum.js';

describe('obterConfiguracaoSecullum', () => {
    const envAnterior = { ...process.env };

    afterEach(() => {
        process.env = { ...envAnterior };
    });

    it('deve retornar valores padrão quando variáveis não estiverem definidas', () => {
        delete process.env.SECULLUM_AUTH_URL;
        delete process.env.SECULLUM_API_URL;
        delete process.env.SECULLUM_CLIENT_ID;
        delete process.env.SECULLUM_USUARIO;
        delete process.env.SECULLUM_SENHA;
        delete process.env.SECULLUM_BANCO_ID;
        delete process.env.SECULLUM_TIMEOUT_MS;

        const configuracao = obterConfiguracaoSecullum();

        expect(configuracao).toEqual({
            urlAutenticador: URL_PADRAO_AUTENTICADOR_SECULLUM,
            urlApiIntegracao: URL_PADRAO_API_INTEGRACAO_SECULLUM,
            clientId: CLIENT_ID_PADRAO_PONTO_WEB,
            usuario: null,
            senha: null,
            bancoId: null,
            timeoutMs: TIMEOUT_REQUISICAO_MS_PADRAO
        });
    });

    it('deve ler credenciais e timeout customizado do ambiente', () => {
        process.env.SECULLUM_AUTH_URL = 'https://auth.custom';
        process.env.SECULLUM_API_URL = 'https://api.custom';
        process.env.SECULLUM_CLIENT_ID = '9';
        process.env.SECULLUM_USUARIO = '  usuario@teste.com ';
        process.env.SECULLUM_SENHA = 'senha-secreta';
        process.env.SECULLUM_BANCO_ID = ' 42 ';
        process.env.SECULLUM_TIMEOUT_MS = '15000';

        const configuracao = obterConfiguracaoSecullum();

        expect(configuracao.urlAutenticador).toBe('https://auth.custom');
        expect(configuracao.urlApiIntegracao).toBe('https://api.custom');
        expect(configuracao.clientId).toBe(9);
        expect(configuracao.usuario).toBe('usuario@teste.com');
        expect(configuracao.senha).toBe('senha-secreta');
        expect(configuracao.bancoId).toBe('42');
        expect(configuracao.timeoutMs).toBe(15_000);
    });

    it('deve usar timeout padrão quando valor informado for inválido', () => {
        process.env.SECULLUM_TIMEOUT_MS = '0';

        const configuracao = obterConfiguracaoSecullum();

        expect(configuracao.timeoutMs).toBe(TIMEOUT_REQUISICAO_MS_PADRAO);
    });
});
