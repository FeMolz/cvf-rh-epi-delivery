import { Link, Navigate } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { PAPEL_ADMIN } from '../../../shared/constants/papeis.js';
import { ROTULOS_PAPEIS } from '../../../shared/constants/papeis.js';
import { LayoutAplicacao } from '../components/LayoutAplicacao.jsx';

export function InicioPage() {
    const { user, autenticado, podeCadastrarUsuarios } = useAuth();

    if (autenticado && user?.role === PAPEL_ADMIN) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (autenticado && podeCadastrarUsuarios) {
        return <Navigate to="/admin/gerenciamento" replace />;
    }

    if (!autenticado) {
        return (
            <LayoutAplicacao
                titulo="Bem-vindo ao RH-System"
                subtitulo="Faça login para acessar o painel e cadastrar usuários com as permissões corretas."
            >
                <Link className="botao botao--primario" to="/login" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
                    Ir para login
                </Link>
            </LayoutAplicacao>
        );
    }

    return (
        <LayoutAplicacao
            titulo={`Olá, ${user.name}`}
            subtitulo={`Você está autenticado como ${ROTULOS_PAPEIS[user.role] || user.role}.`}
        >
            {podeCadastrarUsuarios ? (
                <Link
                    className="botao botao--primario"
                    to="/admin/gerenciamento"
                    style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}
                >
                    Ir para gerenciamento
                </Link>
            ) : (
                <p className="mensagem">
                    Seu perfil não possui permissão para cadastrar usuários. Entre em contato com um administrador.
                </p>
            )}
        </LayoutAplicacao>
    );
}
