import { Outlet } from 'react-router-dom';

import { NavegacaoRelatoriosEpi } from '../components/NavegacaoRelatoriosEpi.jsx';

export function LayoutRelatoriosEntregaEpiPage() {
    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Relatórios de entrega de EPI</h1>
                <p className="admin-pagina__subtitulo">
                    Emita PDFs por período, acompanhe as últimas emissões e controle o fluxo físico dos
                    documentos.
                </p>
            </header>

            <NavegacaoRelatoriosEpi />

            <Outlet />
        </section>
    );
}
