import { useState } from 'react';

import { AbasDashboard } from '../components/AbasDashboard.jsx';
import { PainelCargosDashboard } from '../components/PainelCargosDashboard.jsx';
import { PainelUsuariosDashboard } from '../components/PainelUsuariosDashboard.jsx';

const ABAS_DASHBOARD = [
    { id: 'usuarios', rotulo: 'Usuários' },
    { id: 'cargos', rotulo: 'Cargos' }
];

export function DashboardAdminPage() {
    const [abaAtiva, setAbaAtiva] = useState('usuarios');

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Dashboard</h1>
            </header>

            <AbasDashboard abaAtiva={abaAtiva} abas={ABAS_DASHBOARD} onTrocarAba={setAbaAtiva} />

            {abaAtiva === 'usuarios' ? <PainelUsuariosDashboard /> : <PainelCargosDashboard />}
        </section>
    );
}
