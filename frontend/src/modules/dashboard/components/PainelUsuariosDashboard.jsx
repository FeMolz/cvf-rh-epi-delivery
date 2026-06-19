import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { listarUsuarios } from '../../usuarios/services/usuariosApi.js';
import { filtrarUsuarios, paginarLista } from '../../../shared/utils/listagemUsuarios.js';
import { ITENS_POR_PAGINA_PADRAO, Paginacao } from '../../usuarios/components/Paginacao.jsx';
import { TabelaUsuariosDashboard } from '../../usuarios/components/TabelaUsuariosDashboard.jsx';
import { IconeAbaDashboard } from './IconeAbaDashboard.jsx';

/**
 * @param {{ termoBusca?: string }} props
 */
export function PainelUsuariosDashboard({ termoBusca = '' }) {
    const { token } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
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
        <section className="gerenciamento-painel listagem-painel dashboard-painel">
            <CabecalhoListagemPainel
                icone={<IconeAbaDashboard id="usuarios" />}
                titulo="Usuários"
                descricao="Listagem de acessos cadastrados no portal."
            />

            <div className="listagem-painel__conteudo dashboard-painel__conteudo">
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
