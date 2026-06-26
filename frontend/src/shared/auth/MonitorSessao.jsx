import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from './useAuth.js';
import { obterTempoRestanteJwt, tokenJwtExpirado } from './jwtUtils.js';
import { notificarSessaoExpirada, registrarAoSessaoExpirada } from './sessaoExpirada.js';

export function MonitorSessao() {
    const navegar = useNavigate();
    const { token, encerrarSessaoLocal } = useAuth();

    useEffect(() => {
        registrarAoSessaoExpirada(() => {
            encerrarSessaoLocal();
            navegar('/login', { replace: true, state: { sessaoExpirada: true } });
        });
    }, [navegar, encerrarSessaoLocal]);

    useEffect(() => {
        if (!token) {
            return undefined;
        }

        if (tokenJwtExpirado(token)) {
            notificarSessaoExpirada();
            return undefined;
        }

        const tempoRestante = obterTempoRestanteJwt(token);

        if (tempoRestante === null) {
            return undefined;
        }

        const identificadorTimer = window.setTimeout(() => {
            notificarSessaoExpirada();
        }, tempoRestante);

        return () => {
            window.clearTimeout(identificadorTimer);
        };
    }, [token]);

    return null;
}
