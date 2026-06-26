import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import {
    PAPEL_ALMOXARIFADO,
    PAPEIS_GESTAO_SISTEMA
} from '../../../shared/constants/papeis.js';
import { LayoutAplicacao } from '../components/LayoutAplicacao.jsx';
import { FormularioLogin } from '../components/FormularioLogin.jsx';

export function LoginPage() {
    const { login, carregando, autenticado } = useAuth();
    const navegar = useNavigate();
    const localizacao = useLocation();
    const sessaoExpirada = localizacao.state?.sessaoExpirada === true;

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
            {sessaoExpirada ? (
                <AreaMensagensFeedback aviso="Sua sessão expirou. Faça login novamente para continuar." />
            ) : null}
            <FormularioLogin onSubmit={aoEntrar} carregando={carregando} />
            <p className="formulario__rodape">
                <Link to="/">Voltar ao início</Link>
            </p>
        </LayoutAplicacao>
    );
}
