import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { listarCargos } from '../../cargos/services/cargosApi.js';
import { filtrarCargos } from '../../cargos/utils/listagemCargos.js';
import { paginarLista } from '../../../shared/utils/listagemUsuarios.js';
import { ITENS_POR_PAGINA_PADRAO, Paginacao } from '../../usuarios/components/Paginacao.jsx';
import { IconeAbaDashboard } from './IconeAbaDashboard.jsx';
import { TabelaCargosDashboard } from './TabelaCargosDashboard.jsx';

/**
 * @param {{ termoBusca?: string }} props
 */
export function PainelCargosDashboard({ termoBusca = '' }) {
    const { token } = useAuth();
    const [cargos, setCargos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [pagina, setPagina] = useState(1);

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregando(true);
            setErro('');

            try {
                const lista = await listarCargos(token, { incluirInativos: true });
                if (ativo) {
                    setCargos(lista);
                }
            } catch (erroCapturado) {
                if (ativo) {
                    setErro(erroCapturado.message || 'Não foi possível carregar os cargos.');
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

    const cargosFiltrados = useMemo(
        () => filtrarCargos(cargos, termoBusca),
        [cargos, termoBusca]
    );

    const paginacao = useMemo(
        () => paginarLista(cargosFiltrados, pagina, ITENS_POR_PAGINA_PADRAO),
        [cargosFiltrados, pagina]
    );

    useEffect(() => {
        setPagina(1);
    }, [termoBusca]);

    return (
        <section className="gerenciamento-painel listagem-painel dashboard-painel">
            <CabecalhoListagemPainel
                icone={<IconeAbaDashboard id="cargos" />}
                titulo="Cargos"
                descricao="Listagem de cargos e quantidade de EPIs vinculados."
            />

            <div className="listagem-painel__conteudo dashboard-painel__conteudo">
                {carregando ? (
                    <p className="estado-carregando">Carregando cargos…</p>
                ) : erro ? (
                    <p className="estado-erro" role="alert">
                        {erro}
                    </p>
                ) : (
                    <>
                        <TabelaCargosDashboard cargos={paginacao.itens} />
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
