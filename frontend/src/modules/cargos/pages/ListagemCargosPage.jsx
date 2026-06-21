import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AbasModulo } from '../../../shared/components/AbasModulo.jsx';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { paginarLista } from '../../../shared/utils/listagemUsuarios.js';
import { ITENS_POR_PAGINA_PADRAO, Paginacao } from '../../usuarios/components/Paginacao.jsx';
import { IconeAbaCargos } from '../components/IconeAbaCargos.jsx';
import { TabelaCargos } from '../components/TabelaCargos.jsx';
import { baixarRelatorioCargos, listarCargos } from '../services/cargosApi.js';
import { filtrarCargos } from '../utils/listagemCargos.js';

const ABAS_CARGOS = [
    { id: 'ativos', rotulo: 'Ativos' },
    { id: 'inativos', rotulo: 'Inativos' }
];

export function ListagemCargosPage() {
    const { token } = useAuth();
    const [abaAtiva, setAbaAtiva] = useState('ativos');
    const [cargos, setCargos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [baixandoRelatorio, setBaixandoRelatorio] = useState(false);
    const [erro, setErro] = useState('');
    const [termoBusca, setTermoBusca] = useState('');
    const [pagina, setPagina] = useState(1);

    const apenasInativos = abaAtiva === 'inativos';

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
        setTermoBusca('');
    }, [abaAtiva]);

    async function aoBaixarRelatorio() {
        setBaixandoRelatorio(true);
        setErro('');

        const opcoesRelatorio = {};

        if (abaAtiva === 'inativos') {
            opcoesRelatorio.apenasInativos = true;
        }

        try {
            await baixarRelatorioCargos(token, opcoesRelatorio);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível baixar o relatório.');
        } finally {
            setBaixandoRelatorio(false);
        }
    }

    const abasComIcone = ABAS_CARGOS.map((aba) => ({
        ...aba,
        icone: <IconeAbaCargos id={aba.id} />
    }));

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Cargos</h1>
                <p className="admin-pagina__subtitulo">
                    Consulte cargos ativos e inativos vinculados aos EPIs do sistema.
                </p>
            </header>

            <AbasModulo
                abaAtiva={abaAtiva}
                abas={abasComIcone}
                rotuloAria="Situação dos cargos"
                onTrocarAba={setAbaAtiva}
            />

            <div className="modulo-pesquisa">
                <label className="campo-pesquisa campo-pesquisa--modulo">
                    <span className="visually-hidden">Pesquisar cargos</span>
                    <input
                        type="search"
                        placeholder="Buscar por nome ou descrição…"
                        value={termoBusca}
                        onChange={(evento) => setTermoBusca(evento.target.value)}
                    />
                </label>
            </div>

            <section className="gerenciamento-painel listagem-painel">
                <CabecalhoListagemPainel
                    icone={<IconeAbaCargos id={abaAtiva} />}
                    titulo={apenasInativos ? 'Cargos inativos' : 'Cargos ativos'}
                    descricao={
                        apenasInativos
                            ? 'Cargos desativados que não podem receber novos vínculos.'
                            : 'Cargos disponíveis para funcionários e entregas de EPI.'
                    }
                    acoes={
                        <button
                            className="botao botao--primario"
                            type="button"
                            disabled={baixandoRelatorio || carregando}
                            onClick={aoBaixarRelatorio}
                        >
                            {baixandoRelatorio ? 'Baixando…' : 'Download Relatório'}
                        </button>
                    }
                />

                <div className="listagem-painel__conteudo">
                    {carregando ? (
                        <p className="estado-carregando">Carregando cargos…</p>
                    ) : erro ? (
                        <p className="estado-erro" role="alert">
                            {erro}
                        </p>
                    ) : (
                        <>
                            <TabelaCargos cargos={paginacao.itens} />
                            <Paginacao
                                paginaAtual={paginacao.paginaAtual}
                                totalPaginas={paginacao.totalPaginas}
                                totalItens={paginacao.totalItens}
                                rotuloItens="cargo(s)"
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
