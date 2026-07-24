import { Link, Navigate } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { PAPEL_ALMOXARIFADO, PAPEIS_GESTAO_SISTEMA } from '../../../shared/constants/papeis.js';
import { ROTULOS_PAPEIS } from '../../../shared/constants/papeis.js';
import { LayoutAplicacao } from '../components/LayoutAplicacao.jsx';

export function InicioPage() {
    const { user, autenticado } = useAuth();

    if (autenticado && user?.role === PAPEL_ALMOXARIFADO) {
        return <Navigate to="/admin/epis/entregas" replace />;
    }

    if (autenticado && PAPEIS_GESTAO_SISTEMA.includes(user?.role)) {
        return <Navigate to="/admin/gerenciamento" replace />;
    }

    if (!autenticado) {
        return (
            <LayoutAplicacao
                titulo="Bem-vindo ao CVF Gerenciamento"
                subtitulo="Faça login para acessar o painel com as permissões do seu perfil."
            >
                <Link
                    className="botao botao--primario"
                    to="/login"
                    style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}
                >
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
            <Link
                className="botao botao--primario"
                to="/vagas"
                style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}
            >
                Ver vagas abertas
            </Link>
        </LayoutAplicacao>
    );
}
