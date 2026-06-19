import { useCallback, useMemo, useState } from 'react';

import { PAPEIS_CADASTRO_USUARIO } from '../constants/papeis.js';
import { autenticarUsuario, encerrarSessao } from '../../modules/usuarios/services/usuariosApi.js';
import { AuthContext } from './authContextState.js';

const CHAVE_TOKEN = 'rh_system_token';
const CHAVE_USUARIO = 'rh_system_user';

function lerSessaoArmazenada() {
    try {
        const token = localStorage.getItem(CHAVE_TOKEN);
        const usuarioSerializado = localStorage.getItem(CHAVE_USUARIO);

        if (!token || !usuarioSerializado) {
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

        limparSessaoArmazenada();
        setToken(null);
        setUser(null);
    }, [token]);

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
