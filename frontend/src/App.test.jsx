import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Outlet } from 'react-router-dom';

let rotasIniciais = ['/'];

function criarStub(texto) {
    return function PaginaStub() {
        return <p>{texto}</p>;
    };
}

vi.mock('react-router-dom', async () => {
    const atual = await vi.importActual('react-router-dom');
    return {
        ...atual,
        BrowserRouter: ({ children }) => (
            <atual.MemoryRouter initialEntries={rotasIniciais}>{children}</atual.MemoryRouter>
        )
    };
});

vi.mock('./shared/auth/AuthContext.jsx', () => ({
    AuthProvider: ({ children }) => children
}));

vi.mock('./shared/auth/MonitorSessao.jsx', () => ({
    MonitorSessao: () => null
}));

vi.mock('./shared/auth/RotasProtegidas.jsx', () => ({
    RotasProtegidas: () => <Outlet />
}));

vi.mock('./shared/layout/LayoutAdmin.jsx', () => ({
    LayoutAdmin: () => (
        <div>
            <p>LayoutAdmin</p>
            <Outlet />
        </div>
    )
}));

vi.mock('./shared/layout/RedirecionarAdminInicio.jsx', () => ({
    RedirecionarAdminInicio: criarStub('RedirecionarAdminInicio')
}));

vi.mock('./modules/usuarios/pages/InicioPage.jsx', () => ({
    InicioPage: criarStub('InicioPage')
}));

vi.mock('./modules/usuarios/pages/LoginPage.jsx', () => ({
    LoginPage: criarStub('LoginPage')
}));

vi.mock('./modules/usuarios/pages/CadastroUsuarioPage.jsx', () => ({
    CadastroUsuarioPage: criarStub('CadastroUsuarioPage')
}));

vi.mock('./modules/usuarios/pages/DetalheUsuarioPage.jsx', () => ({
    DetalheUsuarioPage: criarStub('DetalheUsuarioPage')
}));

vi.mock('./modules/gerenciamento/pages/GerenciamentoPage.jsx', () => ({
    GerenciamentoPage: criarStub('GerenciamentoPage')
}));

vi.mock('./modules/noticias/pages/NoticiasPage.jsx', () => ({
    NoticiasPage: criarStub('NoticiasPage')
}));

vi.mock('./modules/cargos/pages/ListagemCargosPage.jsx', () => ({
    ListagemCargosPage: criarStub('ListagemCargosPage')
}));

vi.mock('./modules/cargos/pages/DetalheCargoPage.jsx', () => ({
    DetalheCargoPage: criarStub('DetalheCargoPage')
}));

vi.mock('./modules/empresas/pages/ListagemEmpresasPage.jsx', () => ({
    ListagemEmpresasPage: criarStub('ListagemEmpresasPage')
}));

vi.mock('./modules/empresas/pages/DetalheEmpresaPage.jsx', () => ({
    DetalheEmpresaPage: criarStub('DetalheEmpresaPage')
}));

vi.mock('./modules/setores/pages/ListagemSetoresPage.jsx', () => ({
    ListagemSetoresPage: criarStub('ListagemSetoresPage')
}));

vi.mock('./modules/setores/pages/DetalheSetorPage.jsx', () => ({
    DetalheSetorPage: criarStub('DetalheSetorPage')
}));

vi.mock('./modules/funcionarios/pages/CadastroFuncionarioPage.jsx', () => ({
    CadastroFuncionarioPage: criarStub('CadastroFuncionarioPage')
}));

vi.mock('./modules/funcionarios/pages/EdicaoFuncionarioPage.jsx', () => ({
    EdicaoFuncionarioPage: criarStub('EdicaoFuncionarioPage')
}));

vi.mock('./modules/funcionarios/pages/ListagemFuncionariosPage.jsx', () => ({
    ListagemFuncionariosPage: criarStub('ListagemFuncionariosPage')
}));

vi.mock('./modules/epis/pages/ListagemEpisPage.jsx', () => ({
    ListagemEpisPage: criarStub('ListagemEpisPage')
}));

vi.mock('./modules/epis/pages/VinculoEpisCargoPage.jsx', () => ({
    VinculoEpisCargoPage: criarStub('VinculoEpisCargoPage')
}));

vi.mock('./modules/epi-entregas/pages/RegistroEntregaEpiPage.jsx', () => ({
    RegistroEntregaEpiPage: criarStub('RegistroEntregaEpiPage')
}));

vi.mock('./modules/epi-entregas/pages/EntregaImediataEpiPage.jsx', () => ({
    EntregaImediataEpiPage: criarStub('EntregaImediataEpiPage')
}));

vi.mock('./modules/epi-relatorios/pages/LayoutRelatoriosEntregaEpiPage.jsx', () => ({
    LayoutRelatoriosEntregaEpiPage: () => (
        <div>
            <p>LayoutRelatoriosEntregaEpiPage</p>
            <Outlet />
        </div>
    )
}));

vi.mock('./modules/epi-relatorios/pages/RedirecionarRelatoriosEpiInicio.jsx', () => ({
    RedirecionarRelatoriosEpiInicio: criarStub('RedirecionarRelatoriosEpiInicio')
}));

vi.mock('./modules/epi-relatorios/pages/EmitirRelatorioEpiPage.jsx', () => ({
    EmitirRelatorioEpiPage: criarStub('EmitirRelatorioEpiPage')
}));

vi.mock('./modules/epi-relatorios/pages/UltimasEmissoesRelatorioEpiPage.jsx', () => ({
    UltimasEmissoesRelatorioEpiPage: criarStub('UltimasEmissoesRelatorioEpiPage')
}));

vi.mock('./modules/epi-relatorios/pages/HistoricoEmissoesRelatorioEpiPage.jsx', () => ({
    HistoricoEmissoesRelatorioEpiPage: criarStub('HistoricoEmissoesRelatorioEpiPage')
}));

import App from './App.jsx';

describe('App', () => {
    it('deve renderizar a página inicial', () => {
        rotasIniciais = ['/'];
        render(<App />);
        expect(screen.getByText('InicioPage')).toBeInTheDocument();
    });

    it('deve renderizar a página de login', () => {
        rotasIniciais = ['/login'];
        render(<App />);
        expect(screen.getByText('LoginPage')).toBeInTheDocument();
    });

    it('deve redirecionar rota desconhecida para o início', () => {
        rotasIniciais = ['/rota-inexistente'];
        render(<App />);
        expect(screen.getByText('InicioPage')).toBeInTheDocument();
    });

    it('deve renderizar rotas administrativas aninhadas', () => {
        rotasIniciais = ['/admin/gerenciamento'];
        render(<App />);
        expect(screen.getByText('LayoutAdmin')).toBeInTheDocument();
        expect(screen.getByText('GerenciamentoPage')).toBeInTheDocument();
    });

    it('deve renderizar sub-rotas de relatórios de EPI', () => {
        rotasIniciais = ['/admin/epis/relatorios/emitir'];
        render(<App />);
        expect(screen.getByText('LayoutRelatoriosEntregaEpiPage')).toBeInTheDocument();
        expect(screen.getByText('EmitirRelatorioEpiPage')).toBeInTheDocument();
    });
});
