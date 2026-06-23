import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import {
    PAPEL_ALMOXARIFADO,
    PAPEIS_GESTAO_SISTEMA
} from '../../../shared/constants/papeis.js';
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

        if (usuario.role === PAPEL_ALMOXARIFADO) {
            navegar('/admin/epis/entregas');
            return;
        }

        if (PAPEIS_GESTAO_SISTEMA.includes(usuario.role)) {
            navegar('/admin/gerenciamento');
            return;
        }

        navegar('/');
    }

    return (
        <LayoutAplicacao
            titulo="Acesso ao sistema"
            subtitulo="Entre com suas credenciais para acessar os módulos do CVF Gerenciamento."
        >
            <FormularioLogin onSubmit={aoEntrar} carregando={carregando} />
            <p className="formulario__rodape">
                <Link to="/">Voltar ao início</Link>
            </p>
        </LayoutAplicacao>
    );
}
