import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { PAPEL_ADMIN, PAPEL_ADMINISTRATIVO } from '../../../shared/constants/papeis.js';
import { LayoutAplicacao } from '../components/LayoutAplicacao.jsx';
import { FormularioLogin } from '../components/FormularioLogin.jsx';

export function LoginPage() {
    const { login, carregando, autenticado } = useAuth();
    const navegar = useNavigate();

    if (autenticado) {
        return <Navigate to="/" replace />;
    }

    async function aoEntrar({ email, password }) {
        const usuario = await login(email, password);

        if (usuario.role === PAPEL_ADMIN) {
            navegar('/admin/dashboard');
            return;
        }

        if (usuario.role === PAPEL_ADMINISTRATIVO) {
            navegar('/admin/gerenciamento');
            return;
        }

        navegar('/');
    }

    return (
        <LayoutAplicacao
            titulo="Acesso ao sistema"
            subtitulo="Entre com suas credenciais para gerenciar usuários e demais módulos do RH-System."
        >
            <FormularioLogin onSubmit={aoEntrar} carregando={carregando} />
            <p className="formulario__rodape">
                Primeiro acesso? O administrador inicial é criado via seed no backend.
            </p>
            <p className="formulario__rodape">
                <Link to="/">Voltar ao início</Link>
            </p>
        </LayoutAplicacao>
    );
}
