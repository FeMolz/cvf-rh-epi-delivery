import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { paginarLista } from '../../../shared/utils/listagemUsuarios.js';
import { ITENS_POR_PAGINA_PADRAO, Paginacao } from '../../usuarios/components/Paginacao.jsx';
import { FormularioCargo } from '../components/FormularioCargo.jsx';
import { TabelaCargos } from '../components/TabelaCargos.jsx';
import { criarCargo, listarCargos } from '../services/cargosApi.js';
import { filtrarCargos } from '../utils/listagemCargos.js';

export function ListagemCargosPage() {
    const { token } = useAuth();
    const [cargos, setCargos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [termoBusca, setTermoBusca] = useState('');
    const [pagina, setPagina] = useState(1);
    const [exibirNovoCargo, setExibirNovoCargo] = useState(false);
    const [apenasInativos, setApenasInativos] = useState(false);

    const carregarCargos = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const lista = await listarCargos(token, { apenasInativos });
            setCargos(lista);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar os cargos.');
        } finally {
            setCarregando(false);
        }
    }, [token, apenasInativos]);

    useEffect(() => {
        carregarCargos();
    }, [carregarCargos]);

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

    useEffect(() => {
        setPagina(1);
        setExibirNovoCargo(false);
    }, [apenasInativos]);

    async function aoCadastrar(dados) {
        setSalvando(true);

        try {
            await criarCargo(dados, token);
            await carregarCargos();
            setExibirNovoCargo(false);
        } finally {
            setSalvando(false);
        }
    }

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Cargos</h1>
            </header>

            <div className="painel">
                <div className="painel__cabecalho">
                    {exibirNovoCargo ? (
                        <p className="painel__subtitulo">Cadastre um novo cargo</p>
                    ) : (
                        <>
                            <label className="campo-pesquisa">
                                <span className="visually-hidden">Pesquisar cargos</span>
                                <input
                                    type="search"
                                    placeholder="Buscar por nome ou descrição…"
                                    value={termoBusca}
                                    onChange={(evento) => setTermoBusca(evento.target.value)}
                                />
                            </label>
                            <label className="filtro-fixo">
                                <input
                                    type="checkbox"
                                    checked={apenasInativos}
                                    onChange={(evento) => setApenasInativos(evento.target.checked)}
                                />
                                Apenas inativos
                            </label>
                        </>
                    )}
                    {!apenasInativos ? (
                        <button
                            className="botao botao--primario"
                            type="button"
                            onClick={() => setExibirNovoCargo((atual) => !atual)}
                        >
                            {exibirNovoCargo ? 'Cancelar' : 'Novo cargo'}
                        </button>
                    ) : null}
                </div>

                {exibirNovoCargo ? (
                    <div className="painel__secao-formulario">
                        <FormularioCargo
                            rotuloEnviar="Cadastrar cargo"
                            onSubmit={aoCadastrar}
                            carregando={salvando}
                        />
                    </div>
                ) : null}

                {!exibirNovoCargo && carregando ? (
                    <p className="estado-carregando">Carregando cargos…</p>
                ) : null}

                {!exibirNovoCargo && !carregando && erro ? (
                    <p className="estado-erro" role="alert">
                        {erro}
                    </p>
                ) : null}

                {!exibirNovoCargo && !carregando && !erro ? (
                    <>
                        <TabelaCargos cargos={paginacao.itens} />
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
                ) : null}
            </div>
        </section>
    );
}
