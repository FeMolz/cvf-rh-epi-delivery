import { Navigate } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { usuarioPodeGerenciarRelatoriosEpi } from '../components/FormularioEmitirRelatorio.jsx';

export function RedirecionarRelatoriosEpiInicio() {
    const { user } = useAuth();
    const destino = usuarioPodeGerenciarRelatoriosEpi(user?.role) ? 'emitir' : 'ultimas';

    return <Navigate to={destino} replace />;
}
