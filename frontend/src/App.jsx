import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './shared/auth/AuthContext.jsx';
import { MonitorSessao } from './shared/auth/MonitorSessao.jsx';
import { RotasProtegidas } from './shared/auth/RotasProtegidas.jsx';
import {
    PAPEIS_AREA_ADMIN,
    PAPEIS_GESTAO_SISTEMA
} from './shared/constants/papeis.js';
import { LayoutAdmin } from './shared/layout/LayoutAdmin.jsx';
import { RedirecionarAdminInicio } from './shared/layout/RedirecionarAdminInicio.jsx';
import { RedirecionarComQuery } from './shared/layout/RedirecionarComQuery.jsx';
import { CadastramentoPage } from './modules/cadastramento/pages/CadastramentoPage.jsx';
import { DepartamentoPessoalPage } from './modules/departamento-pessoal/pages/DepartamentoPessoalPage.jsx';
import { NoticiasPage } from './modules/noticias/pages/NoticiasPage.jsx';
import { DetalheUsuarioPage } from './modules/usuarios/pages/DetalheUsuarioPage.jsx';
import { GerenciamentoPage } from './modules/gerenciamento/pages/GerenciamentoPage.jsx';
import { DetalheCargoPage } from './modules/cargos/pages/DetalheCargoPage.jsx';
import { DetalheEmpresaPage } from './modules/empresas/pages/DetalheEmpresaPage.jsx';
import { DetalheSetorPage } from './modules/setores/pages/DetalheSetorPage.jsx';
import { CadastroFuncionarioPage } from './modules/funcionarios/pages/CadastroFuncionarioPage.jsx';
import { EdicaoFuncionarioPage } from './modules/funcionarios/pages/EdicaoFuncionarioPage.jsx';
import { ListagemEpisPage } from './modules/epis/pages/ListagemEpisPage.jsx';
import { VinculoEpisCargoPage } from './modules/epis/pages/VinculoEpisCargoPage.jsx';
import { RegistroEntregaEpiPage } from './modules/epi-entregas/pages/RegistroEntregaEpiPage.jsx';
import { EntregaImediataEpiPage } from './modules/epi-entregas/pages/EntregaImediataEpiPage.jsx';
import { LayoutRelatoriosEntregaEpiPage } from './modules/epi-relatorios/pages/LayoutRelatoriosEntregaEpiPage.jsx';
import { RedirecionarRelatoriosEpiInicio } from './modules/epi-relatorios/pages/RedirecionarRelatoriosEpiInicio.jsx';
import { EmitirRelatorioEpiPage } from './modules/epi-relatorios/pages/EmitirRelatorioEpiPage.jsx';
import { UltimasEmissoesRelatorioEpiPage } from './modules/epi-relatorios/pages/UltimasEmissoesRelatorioEpiPage.jsx';
import { HistoricoEmissoesRelatorioEpiPage } from './modules/epi-relatorios/pages/HistoricoEmissoesRelatorioEpiPage.jsx';
import { InicioPage } from './modules/usuarios/pages/InicioPage.jsx';
import { LoginPage } from './modules/usuarios/pages/LoginPage.jsx';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <MonitorSessao />
                <Routes>
                    <Route path="/" element={<InicioPage />} />
                    <Route path="/login" element={<LoginPage />} />

                    <Route element={<RotasProtegidas papeisPermitidos={PAPEIS_AREA_ADMIN} />}>
                        <Route path="/admin" element={<LayoutAdmin />}>
                            <Route index element={<RedirecionarAdminInicio />} />

                            <Route path="epis/entregas" element={<RegistroEntregaEpiPage />} />
                            <Route path="epis/entregas/imediata" element={<EntregaImediataEpiPage />} />

                            <Route element={<RotasProtegidas papeisPermitidos={PAPEIS_GESTAO_SISTEMA} />}>
                                <Route path="cadastramento" element={<CadastramentoPage />} />
                                <Route path="gerenciamento" element={<GerenciamentoPage />} />
                                <Route
                                    path="departamento-pessoal"
                                    element={<DepartamentoPessoalPage />}
                                />
                                <Route
                                    path="usuarios/cadastro"
                                    element={
                                        <RedirecionarComQuery destino="/admin/cadastramento?secao=usuarios" />
                                    }
                                />
                                <Route
                                    path="cargos"
                                    element={
                                        <RedirecionarComQuery destino="/admin/gerenciamento?secao=cargos" />
                                    }
                                />
                                <Route path="cargos/:id" element={<DetalheCargoPage />} />
                                <Route
                                    path="empresas"
                                    element={
                                        <RedirecionarComQuery destino="/admin/gerenciamento?secao=empresas" />
                                    }
                                />
                                <Route path="empresas/:id" element={<DetalheEmpresaPage />} />
                                <Route
                                    path="setores"
                                    element={
                                        <RedirecionarComQuery destino="/admin/gerenciamento?secao=setores" />
                                    }
                                />
                                <Route path="setores/:id" element={<DetalheSetorPage />} />
                                <Route
                                    path="funcionarios"
                                    element={
                                        <RedirecionarComQuery destino="/admin/departamento-pessoal?secao=funcionarios" />
                                    }
                                />
                                <Route
                                    path="funcionarios/cadastro"
                                    element={
                                        <RedirecionarComQuery destino="/admin/cadastramento?secao=funcionarios" />
                                    }
                                />
                                <Route path="funcionarios/:id" element={<EdicaoFuncionarioPage />} />
                                <Route path="usuarios/:id" element={<DetalheUsuarioPage />} />
                                <Route path="noticias" element={<NoticiasPage />} />
                                <Route path="epis" element={<ListagemEpisPage />} />
                                <Route path="epis/vinculos" element={<VinculoEpisCargoPage />} />
                                <Route path="epis/relatorios" element={<LayoutRelatoriosEntregaEpiPage />}>
                                    <Route index element={<RedirecionarRelatoriosEpiInicio />} />
                                    <Route path="emitir" element={<EmitirRelatorioEpiPage />} />
                                    <Route path="ultimas" element={<UltimasEmissoesRelatorioEpiPage />} />
                                    <Route path="historico" element={<HistoricoEmissoesRelatorioEpiPage />} />
                                </Route>
                            </Route>
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
