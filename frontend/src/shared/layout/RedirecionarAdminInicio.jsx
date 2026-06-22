import { Navigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth.js';
import { PAPEL_ALMOXARIFADO } from '../constants/papeis.js';

export function RedirecionarAdminInicio() {
    const { user } = useAuth();

    if (user?.role === PAPEL_ALMOXARIFADO) {
        return <Navigate to="/admin/epis/entregas" replace />;
    }

    return <Navigate to="/admin/gerenciamento" replace />;
}
