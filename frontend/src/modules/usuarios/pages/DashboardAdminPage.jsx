import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { listarUsuarios } from '../services/usuariosApi.js';
import { filtrarUsuarios, paginarLista } from '../../../shared/utils/listagemUsuarios.js';
import { ITENS_POR_PAGINA_PADRAO, Paginacao } from '../components/Paginacao.jsx';
import { TabelaUsuariosDashboard } from '../components/TabelaUsuariosDashboard.jsx';

export function DashboardAdminPage() {
    const { token } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [termoBusca, setTermoBusca] = useState('');
    const [pagina, setPagina] = useState(1);

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregando(true);
            setErro('');

            try {
                const lista = await listarUsuarios(token);
                if (ativo) {
                    setUsuarios(lista);
                }
            } catch (erroCapturado) {
                if (ativo) {
                    setErro(erroCapturado.message || 'Não foi possível carregar os usuários.');
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, [token]);

    const usuariosFiltrados = useMemo(
        () => filtrarUsuarios(usuarios, termoBusca),
        [usuarios, termoBusca]
    );

    const paginacao = useMemo(
        () => paginarLista(usuariosFiltrados, pagina, ITENS_POR_PAGINA_PADRAO),
        [usuariosFiltrados, pagina]
    );

    useEffect(() => {
        setPagina(1);
    }, [termoBusca]);

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Dashboard</h1>
            </header>

            <div className="painel">
                <div className="painel__cabecalho">
                    <label className="campo-pesquisa">
                        <span className="visually-hidden">Pesquisar usuários</span>
                        <input
                            type="search"
                            placeholder="Buscar por nome, e-mail ou permissão…"
                            value={termoBusca}
                            onChange={(evento) => setTermoBusca(evento.target.value)}
                        />
                    </label>
                </div>

                {carregando ? (
                    <p className="estado-carregando">Carregando usuários…</p>
                ) : erro ? (
                    <p className="estado-erro" role="alert">
                        {erro}
                    </p>
                ) : (
                    <>
                        <TabelaUsuariosDashboard usuarios={paginacao.itens} />
                        <Paginacao
                            paginaAtual={paginacao.paginaAtual}
                            totalPaginas={paginacao.totalPaginas}
                            totalItens={paginacao.totalItens}
                            onPaginaAnterior={() => setPagina((atual) => Math.max(1, atual - 1))}
                            onProximaPagina={() =>
                                setPagina((atual) => Math.min(paginacao.totalPaginas, atual + 1))
                            }
                        />
                    </>
                )}
            </div>
        </section>
    );
}
