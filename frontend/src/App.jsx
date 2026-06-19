import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './shared/auth/AuthContext.jsx';
import { RotasProtegidas } from './shared/auth/RotasProtegidas.jsx';
import { PAPEIS_CADASTRO_USUARIO, PAPEL_ADMIN } from './shared/constants/papeis.js';
import { LayoutAdmin } from './shared/layout/LayoutAdmin.jsx';
import { RedirecionarAdminInicio } from './shared/layout/RedirecionarAdminInicio.jsx';
import { CadastroUsuarioPage } from './modules/usuarios/pages/CadastroUsuarioPage.jsx';
import { DashboardAdminPage } from './modules/dashboard/pages/DashboardAdminPage.jsx';
import { DetalheUsuarioPage } from './modules/usuarios/pages/DetalheUsuarioPage.jsx';
import { ListagemCargosPage } from './modules/cargos/pages/ListagemCargosPage.jsx';
import { DetalheCargoPage } from './modules/cargos/pages/DetalheCargoPage.jsx';
import { InicioPage } from './modules/usuarios/pages/InicioPage.jsx';
import { LoginPage } from './modules/usuarios/pages/LoginPage.jsx';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<InicioPage />} />
                    <Route path="/login" element={<LoginPage />} />

                    <Route element={<RotasProtegidas papeisPermitidos={PAPEIS_CADASTRO_USUARIO} />}>
                        <Route path="/admin" element={<LayoutAdmin />}>
                            <Route index element={<RedirecionarAdminInicio />} />
                            <Route path="usuarios/cadastro" element={<CadastroUsuarioPage />} />
                            <Route path="cargos" element={<ListagemCargosPage />} />
                            <Route path="cargos/:id" element={<DetalheCargoPage />} />

                            <Route element={<RotasProtegidas papeisPermitidos={[PAPEL_ADMIN]} />}>
                                <Route path="dashboard" element={<DashboardAdminPage />} />
                                <Route path="usuarios/:id" element={<DetalheUsuarioPage />} />
                            </Route>
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
