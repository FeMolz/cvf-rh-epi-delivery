import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AbasModulo } from '../../../shared/components/AbasModulo.jsx';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { paginarLista } from '../../../shared/utils/listagemUsuarios.js';
import { ITENS_POR_PAGINA_PADRAO, Paginacao } from '../../usuarios/components/Paginacao.jsx';
import { IconeAbaSetores } from '../components/IconeAbaSetores.jsx';
import { TabelaSetores } from '../components/TabelaSetores.jsx';
import { listarSetores } from '../services/setoresApi.js';
import { filtrarSetores, filtrarSetoresPorSituacao } from '../utils/listagemSetores.js';

const ABAS_SETORES = [
    { id: 'ativos', rotulo: 'Ativos' },
    { id: 'inativos', rotulo: 'Inativos' }
];

export function ListagemSetoresPage() {
    const { token } = useAuth();
    const [abaAtiva, setAbaAtiva] = useState('ativos');
    const [setores, setSetores] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [termoBusca, setTermoBusca] = useState('');
    const [pagina, setPagina] = useState(1);

    const apenasInativos = abaAtiva === 'inativos';

    const carregarSetores = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const lista = await listarSetores(token);
            setSetores(lista);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar os setores.');
        } finally {
            setCarregando(false);
        }
    }, [token]);

    useEffect(() => {
        carregarSetores();
    }, [carregarSetores]);

    const setoresFiltrados = useMemo(() => {
        const porSituacao = filtrarSetoresPorSituacao(setores, apenasInativos);
        return filtrarSetores(porSituacao, termoBusca);
    }, [setores, apenasInativos, termoBusca]);

    const paginacao = useMemo(
        () => paginarLista(setoresFiltrados, pagina, ITENS_POR_PAGINA_PADRAO),
        [setoresFiltrados, pagina]
    );

    useEffect(() => {
        setPagina(1);
    }, [termoBusca]);

    useEffect(() => {
        setPagina(1);
        setTermoBusca('');
    }, [abaAtiva]);

    const abasComIcone = ABAS_SETORES.map((aba) => ({
        ...aba,
        icone: <IconeAbaSetores id={aba.id} />
    }));

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Setores</h1>
                <p className="admin-pagina__subtitulo">
                    Consulte setores ativos e inativos vinculados aos funcionários do sistema.
                </p>
            </header>

            <AbasModulo
                abaAtiva={abaAtiva}
                abas={abasComIcone}
                rotuloAria="Situação dos setores"
                onTrocarAba={setAbaAtiva}
            />

            <div className="modulo-pesquisa">
                <label className="campo-pesquisa campo-pesquisa--modulo">
                    <span className="visually-hidden">Pesquisar setores</span>
                    <input
                        type="search"
                        placeholder="Buscar por nome…"
                        value={termoBusca}
                        onChange={(evento) => setTermoBusca(evento.target.value)}
                    />
                </label>
            </div>

            <section className="gerenciamento-painel listagem-painel">
                <CabecalhoListagemPainel
                    icone={<IconeAbaSetores id={abaAtiva} />}
                    titulo={apenasInativos ? 'Setores inativos' : 'Setores ativos'}
                    descricao={
                        apenasInativos
                            ? 'Setores desativados que não podem receber novos vínculos.'
                            : 'Setores disponíveis para funcionários e processos de RH.'
                    }
                />

                <div className="listagem-painel__conteudo">
                    {carregando ? (
                        <p className="estado-carregando">Carregando setores…</p>
                    ) : erro ? (
                        <p className="estado-erro" role="alert">
                            {erro}
                        </p>
                    ) : (
                        <>
                            <TabelaSetores setores={paginacao.itens} />
                            <Paginacao
                                paginaAtual={paginacao.paginaAtual}
                                totalPaginas={paginacao.totalPaginas}
                                totalItens={paginacao.totalItens}
                                rotuloItens="setor(es)"
                                onPaginaAnterior={() => setPagina((atual) => Math.max(1, atual - 1))}
                                onProximaPagina={() =>
                                    setPagina((atual) => Math.min(paginacao.totalPaginas, atual + 1))
                                }
                            />
                        </>
                    )}
                </div>
            </section>
        </section>
    );
}
