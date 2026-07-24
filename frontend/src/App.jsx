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
import { CadastroUsuarioPage } from './modules/usuarios/pages/CadastroUsuarioPage.jsx';
import { NoticiasPage } from './modules/noticias/pages/NoticiasPage.jsx';
import { DetalheUsuarioPage } from './modules/usuarios/pages/DetalheUsuarioPage.jsx';
import { GerenciamentoPage } from './modules/gerenciamento/pages/GerenciamentoPage.jsx';
import { ListagemCargosPage } from './modules/cargos/pages/ListagemCargosPage.jsx';
import { DetalheCargoPage } from './modules/cargos/pages/DetalheCargoPage.jsx';
import { ListagemEmpresasPage } from './modules/empresas/pages/ListagemEmpresasPage.jsx';
import { DetalheEmpresaPage } from './modules/empresas/pages/DetalheEmpresaPage.jsx';
import { ListagemSetoresPage } from './modules/setores/pages/ListagemSetoresPage.jsx';
import { DetalheSetorPage } from './modules/setores/pages/DetalheSetorPage.jsx';
import { CadastroFuncionarioPage } from './modules/funcionarios/pages/CadastroFuncionarioPage.jsx';
import { EdicaoFuncionarioPage } from './modules/funcionarios/pages/EdicaoFuncionarioPage.jsx';
import { ListagemFuncionariosPage } from './modules/funcionarios/pages/ListagemFuncionariosPage.jsx';
import { ListagemEpisPage } from './modules/epis/pages/ListagemEpisPage.jsx';
import { VinculoEpisCargoPage } from './modules/epis/pages/VinculoEpisCargoPage.jsx';
import { RegistroEntregaEpiPage } from './modules/epi-entregas/pages/RegistroEntregaEpiPage.jsx';
import { EntregaImediataEpiPage } from './modules/epi-entregas/pages/EntregaImediataEpiPage.jsx';
import { LayoutRelatoriosEntregaEpiPage } from './modules/epi-relatorios/pages/LayoutRelatoriosEntregaEpiPage.jsx';
import { RedirecionarRelatoriosEpiInicio } from './modules/epi-relatorios/pages/RedirecionarRelatoriosEpiInicio.jsx';
import { EmitirRelatorioEpiPage } from './modules/epi-relatorios/pages/EmitirRelatorioEpiPage.jsx';
import { UltimasEmissoesRelatorioEpiPage } from './modules/epi-relatorios/pages/UltimasEmissoesRelatorioEpiPage.jsx';
import { HistoricoEmissoesRelatorioEpiPage } from './modules/epi-relatorios/pages/HistoricoEmissoesRelatorioEpiPage.jsx';
import { DetalheVagaAdminPage } from './modules/recrutamento/pages/DetalheVagaAdminPage.jsx';
import { ListagemVagasAdminPage } from './modules/recrutamento/pages/ListagemVagasAdminPage.jsx';
import { CadastroContratacaoPublicoPage } from './modules/recrutamento/pages/CadastroContratacaoPublicoPage.jsx';
import { DetalheVagaPublicaPage } from './modules/recrutamento/pages/DetalheVagaPublicaPage.jsx';
import { ListagemVagasPublicaPage } from './modules/recrutamento/pages/ListagemVagasPublicaPage.jsx';
import { ValidarCadastroContratacaoPage } from './modules/recrutamento/pages/ValidarCadastroContratacaoPage.jsx';
import { DetalheVagaPage } from './modules/recrutamento/pages/DetalheVagaPage.jsx';
import { ListagemVagasPage } from './modules/recrutamento/pages/ListagemVagasPage.jsx';
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
                    <Route path="/publico/vagas" element={<ListagemVagasPublicaPage />} />
                    <Route path="/publico/vagas/:id" element={<DetalheVagaPublicaPage />} />
                    <Route
                        path="/publico/cadastro-contratacao/:token"
                        element={<CadastroContratacaoPublicoPage />}
                    />

                    <Route element={<RotasProtegidas />}>
                        <Route path="/vagas" element={<ListagemVagasPage />} />
                        <Route path="/vagas/:id" element={<DetalheVagaPage />} />
                    </Route>

                    <Route element={<RotasProtegidas papeisPermitidos={PAPEIS_AREA_ADMIN} />}>
                        <Route path="/admin" element={<LayoutAdmin />}>
                            <Route index element={<RedirecionarAdminInicio />} />

                            <Route path="epis/entregas" element={<RegistroEntregaEpiPage />} />
                            <Route path="epis/entregas/imediata" element={<EntregaImediataEpiPage />} />

                            <Route element={<RotasProtegidas papeisPermitidos={PAPEIS_GESTAO_SISTEMA} />}>
                                <Route path="gerenciamento" element={<GerenciamentoPage />} />
                                <Route path="usuarios/cadastro" element={<CadastroUsuarioPage />} />
                                <Route path="cargos" element={<ListagemCargosPage />} />
                                <Route path="cargos/:id" element={<DetalheCargoPage />} />
                                <Route path="empresas" element={<ListagemEmpresasPage />} />
                                <Route path="empresas/:id" element={<DetalheEmpresaPage />} />
                                <Route path="setores" element={<ListagemSetoresPage />} />
                                <Route path="setores/:id" element={<DetalheSetorPage />} />
                                <Route path="funcionarios" element={<ListagemFuncionariosPage />} />
                                <Route path="funcionarios/cadastro" element={<CadastroFuncionarioPage />} />
                                <Route path="funcionarios/:id" element={<EdicaoFuncionarioPage />} />
                                <Route path="usuarios/:id" element={<DetalheUsuarioPage />} />
                                <Route path="noticias" element={<NoticiasPage />} />
                                <Route path="recrutamento" element={<ListagemVagasAdminPage />} />
                                <Route
                                    path="recrutamento/cadastros/:id/validar"
                                    element={<ValidarCadastroContratacaoPage />}
                                />
                                <Route path="recrutamento/:id" element={<DetalheVagaAdminPage />} />
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
