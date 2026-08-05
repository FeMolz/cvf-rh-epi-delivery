import { Navigate, useLocation } from 'react-router-dom';

/**
 * @param {{ destino: string }} props
 */
export function RedirecionarComQuery({ destino }) {
    const location = useLocation();
    const alvo = location.search ? `${destino}${location.search}` : destino;

    return <Navigate to={alvo} replace />;
}
