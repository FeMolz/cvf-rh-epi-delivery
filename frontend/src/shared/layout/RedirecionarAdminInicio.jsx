import { Navigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth.js';
import { PAPEL_ADMIN } from '../constants/papeis.js';

export function RedirecionarAdminInicio() {
    const { user } = useAuth();

    if (user?.role === PAPEL_ADMIN) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/admin/usuarios/cadastro" replace />;
}
