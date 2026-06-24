import { useCallback, useEffect, useMemo, useState } from 'react';

import { PAPEIS_CADASTRO_USUARIO } from '../constants/papeis.js';
import { autenticarUsuario, encerrarSessao } from '../../modules/usuarios/services/usuariosApi.js';
import { AuthContext } from './authContextState.js';
import { obterExpiracaoJwtEmMs, tokenJwtExpirado } from './obterExpiracaoJwt.js';
import { registrarCallbackSessaoExpirada } from './sessaoExpirada.js';

const CHAVE_TOKEN = 'rh_system_token';
const CHAVE_USUARIO = 'rh_system_user';

function lerSessaoArmazenada() {
    try {
        const token = localStorage.getItem(CHAVE_TOKEN);
        const usuarioSerializado = localStorage.getItem(CHAVE_USUARIO);

        if (!token || !usuarioSerializado) {
            return { token: null, user: null };
        }

        if (tokenJwtExpirado(token)) {
            localStorage.removeItem(CHAVE_TOKEN);
            localStorage.removeItem(CHAVE_USUARIO);
            return { token: null, user: null };
        }

        return {
            token,
            user: JSON.parse(usuarioSerializado)
        };
    } catch {
        return { token: null, user: null };
    }
}

function persistirSessao(token, user) {
    localStorage.setItem(CHAVE_TOKEN, token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(user));
}

function limparSessaoArmazenada() {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
}

export function AuthProvider({ children }) {
    const sessaoInicial = lerSessaoArmazenada();
    const [token, setToken] = useState(sessaoInicial.token);
    const [user, setUser] = useState(sessaoInicial.user);
    const [carregando, setCarregando] = useState(false);

    const encerrarSessaoLocal = useCallback(() => {
        limparSessaoArmazenada();
        setToken(null);
        setUser(null);
    }, []);

    useEffect(() => registrarCallbackSessaoExpirada(encerrarSessaoLocal), [encerrarSessaoLocal]);

    useEffect(() => {
        if (!token) {
            return undefined;
        }

        if (tokenJwtExpirado(token)) {
            encerrarSessaoLocal();
            return undefined;
        }

        const expiraEm = obterExpiracaoJwtEmMs(token);

        if (!expiraEm) {
            return undefined;
        }

        const restanteMs = expiraEm - Date.now();

        if (restanteMs <= 0) {
            encerrarSessaoLocal();
            return undefined;
        }

        const timer = window.setTimeout(encerrarSessaoLocal, restanteMs);

        function verificarAoRetornarParaAba() {
            if (document.visibilityState !== 'visible') {
                return;
            }

            if (tokenJwtExpirado(token)) {
                encerrarSessaoLocal();
            }
        }

        window.addEventListener('focus', verificarAoRetornarParaAba);
        document.addEventListener('visibilitychange', verificarAoRetornarParaAba);

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('focus', verificarAoRetornarParaAba);
            document.removeEventListener('visibilitychange', verificarAoRetornarParaAba);
        };
    }, [token, encerrarSessaoLocal]);

    const login = useCallback(async (email, password) => {
        setCarregando(true);

        try {
            const resultado = await autenticarUsuario({ email, password });
            persistirSessao(resultado.token, resultado.user);
            setToken(resultado.token);
            setUser(resultado.user);
            return resultado.user;
        } finally {
            setCarregando(false);
        }
    }, []);

    const logout = useCallback(async () => {
        if (token) {
            try {
                await encerrarSessao(token);
            } catch {
                /* ignora falha de rede no logout */
            }
        }

        encerrarSessaoLocal();
    }, [token, encerrarSessaoLocal]);

    const valor = useMemo(
        () => ({
            user,
            token,
            carregando,
            autenticado: Boolean(token && user),
            podeCadastrarUsuarios: user ? PAPEIS_CADASTRO_USUARIO.includes(user.role) : false,
            login,
            logout
        }),
        [user, token, carregando, login, logout]
    );

    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
