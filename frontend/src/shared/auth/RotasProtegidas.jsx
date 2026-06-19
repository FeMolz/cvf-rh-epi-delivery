import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from './useAuth.js';

/**
 * @param {{ papeisPermitidos?: string[], redirecionarPara?: string }} props
 */
export function RotasProtegidas({ papeisPermitidos, redirecionarPara = '/login' }) {
    const { autenticado, user } = useAuth();

    if (!autenticado) {
        return <Navigate to={redirecionarPara} replace />;
    }

    if (papeisPermitidos?.length && !papeisPermitidos.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
