import { Navigate } from 'react-router-dom';

export function CadastroFuncionarioPage() {
    return <Navigate to="/admin/gerenciamento?secao=funcionarios" replace />;
}
