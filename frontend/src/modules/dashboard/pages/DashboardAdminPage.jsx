import { useState } from 'react';

import { AbasDashboard } from '../components/AbasDashboard.jsx';
import { PainelCargosDashboard } from '../components/PainelCargosDashboard.jsx';
import { PainelUsuariosDashboard } from '../components/PainelUsuariosDashboard.jsx';

const ABAS_DASHBOARD = [
    { id: 'usuarios', rotulo: 'Usuários' },
    { id: 'cargos', rotulo: 'Cargos' }
];

const PLACEHOLDER_PESQUISA = {
    usuarios: 'Buscar por nome, e-mail ou permissão…',
    cargos: 'Buscar por nome, descrição ou status…'
};

export function DashboardAdminPage() {
    const [abaAtiva, setAbaAtiva] = useState('usuarios');
    const [termoBusca, setTermoBusca] = useState('');

    function trocarAba(id) {
        setAbaAtiva(id);
        setTermoBusca('');
    }

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Dashboard</h1>
                <p className="admin-pagina__subtitulo">
                    Visão geral de usuários e cargos cadastrados no sistema.
                </p>
            </header>

            <AbasDashboard abaAtiva={abaAtiva} abas={ABAS_DASHBOARD} onTrocarAba={trocarAba} />

            <div className="modulo-pesquisa">
                <label className="campo-pesquisa campo-pesquisa--modulo">
                    <span className="visually-hidden">
                        {abaAtiva === 'usuarios' ? 'Pesquisar usuários' : 'Pesquisar cargos'}
                    </span>
                    <input
                        type="search"
                        placeholder={PLACEHOLDER_PESQUISA[abaAtiva]}
                        value={termoBusca}
                        onChange={(evento) => setTermoBusca(evento.target.value)}
                    />
                </label>
            </div>

            {abaAtiva === 'usuarios' ? (
                <PainelUsuariosDashboard termoBusca={termoBusca} />
            ) : (
                <PainelCargosDashboard termoBusca={termoBusca} />
            )}
        </section>
    );
}
