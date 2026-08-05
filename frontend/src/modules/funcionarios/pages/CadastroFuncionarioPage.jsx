import { Navigate } from 'react-router-dom';

export function CadastroFuncionarioPage() {
    return <Navigate to="/admin/cadastramento?secao=funcionarios" replace />;
}
