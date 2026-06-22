import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AbasModulo } from '../../../shared/components/AbasModulo.jsx';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { paginarLista } from '../../../shared/utils/listagemUsuarios.js';
import { listarCargos } from '../../cargos/services/cargosApi.js';
import { obterQuantidadeEpis } from '../../cargos/utils/listagemCargos.js';
import { ITENS_POR_PAGINA_PADRAO, Paginacao } from '../../usuarios/components/Paginacao.jsx';
import { IconeAbaEpis } from '../components/IconeAbaEpis.jsx';
import { NavegacaoEpis } from '../components/NavegacaoEpis.jsx';
import { SeletorCargoEpis } from '../components/FormularioVinculoEpi.jsx';
import { TabelaEpis } from '../components/TabelaEpis.jsx';
import { TabelaEpisCargo } from '../components/TabelaEpisCargo.jsx';
import { listarEpis } from '../services/episApi.js';
import { listarEpisPorCargo } from '../services/rolesEpisApi.js';
import {
    filtrarEpis,
    filtrarEpisPorSituacao,
    filtrarVinculosEpiCargo
} from '../utils/listagemEpis.js';
import './epis.css';

const ABAS_EPIS = [
    { id: 'ativos', rotulo: 'Ativos' },
    { id: 'inativos', rotulo: 'Inativos' }
];

export function ListagemEpisPage() {
    const { token } = useAuth();
    const [abaAtiva, setAbaAtiva] = useState('ativos');
    const [episCache, setEpisCache] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [cargoSelecionadoId, setCargoSelecionadoId] = useState('');
    const [vinculosCargo, setVinculosCargo] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [carregandoCargo, setCarregandoCargo] = useState(false);
    const [erro, setErro] = useState('');
    const [termoBusca, setTermoBusca] = useState('');
    const [pagina, setPagina] = useState(1);

    const visualizandoPorCargo = Boolean(cargoSelecionadoId);
    const apenasInativos = abaAtiva === 'inativos';

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const [listaEpis, listaCargos] = await Promise.all([
                listarEpis(token),
                listarCargos(token, { incluirInativos: true })
            ]);

            setEpisCache(listaEpis);
            setCargos(listaCargos.filter((cargo) => obterQuantidadeEpis(cargo) > 0));
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar os EPIs.');
        } finally {
            setCarregando(false);
        }
    }, [token]);

    const carregarEpisDoCargo = useCallback(async () => {
        if (!cargoSelecionadoId) {
            setVinculosCargo([]);
            return;
        }

        setCarregandoCargo(true);
        setErro('');

        try {
            const lista = await listarEpisPorCargo(cargoSelecionadoId, token);
            setVinculosCargo(lista);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar os EPIs do cargo.');
        } finally {
            setCarregandoCargo(false);
        }
    }, [cargoSelecionadoId, token]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    useEffect(() => {
        carregarEpisDoCargo();
    }, [carregarEpisDoCargo]);

    const cargoSelecionado = useMemo(
        () => cargos.find((cargo) => String(cargo.id) === cargoSelecionadoId),
        [cargos, cargoSelecionadoId]
    );

    const episFiltrados = useMemo(() => {
        const porSituacao = filtrarEpisPorSituacao(episCache, apenasInativos);
        return filtrarEpis(porSituacao, termoBusca);
    }, [episCache, apenasInativos, termoBusca]);

    const vinculosFiltrados = useMemo(
        () => filtrarVinculosEpiCargo(vinculosCargo, termoBusca),
        [vinculosCargo, termoBusca]
    );

    const itensPaginados = useMemo(() => {
        const lista = visualizandoPorCargo ? vinculosFiltrados : episFiltrados;
        return paginarLista(lista, pagina, ITENS_POR_PAGINA_PADRAO);
    }, [visualizandoPorCargo, vinculosFiltrados, episFiltrados, pagina]);

    useEffect(() => {
        setPagina(1);
    }, [termoBusca, abaAtiva, cargoSelecionadoId]);

    const abasComIcone = ABAS_EPIS.map((aba) => ({
        ...aba,
        icone: <IconeAbaEpis id={aba.id === 'ativos' ? 'listagem' : 'vinculos'} />
    }));

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>EPIs</h1>
                <p className="admin-pagina__subtitulo">
                    Consulte o cache local de EPIs ou visualize os equipamentos vinculados a um cargo.
                </p>
            </header>

            <NavegacaoEpis />

            <SeletorCargoEpis
                cargos={cargos}
                cargoSelecionadoId={cargoSelecionadoId}
                rotulo="Visualizar EPIs por cargo (opcional)"
                opcaoVaziaRotulo="Todos os EPIs em cache"
                onSelecionar={setCargoSelecionadoId}
            />

            {!visualizandoPorCargo ? (
                <AbasModulo
                    abaAtiva={abaAtiva}
                    abas={abasComIcone}
                    rotuloAria="Situação dos EPIs em cache"
                    onTrocarAba={setAbaAtiva}
                />
            ) : null}

            <div className="modulo-pesquisa">
                <label className="campo-pesquisa campo-pesquisa--modulo">
                    <span className="visually-hidden">Pesquisar EPIs</span>
                    <input
                        type="search"
                        placeholder={
                            visualizandoPorCargo
                                ? 'Buscar por nome, CA ou periodicidade…'
                                : 'Buscar por nome ou CA…'
                        }
                        value={termoBusca}
                        onChange={(evento) => setTermoBusca(evento.target.value)}
                    />
                </label>
            </div>

            <section className="gerenciamento-painel listagem-painel">
                <CabecalhoListagemPainel
                    icone={<IconeAbaEpis id="listagem" />}
                    titulo={
                        visualizandoPorCargo
                            ? `EPIs do cargo ${cargoSelecionado?.name || ''}`
                            : apenasInativos
                              ? 'EPIs inativos em cache'
                              : 'EPIs ativos em cache'
                    }
                    descricao={
                        visualizandoPorCargo
                            ? 'Equipamentos vinculados ao cargo selecionado.'
                            : 'Lista completa de EPIs armazenados localmente após consulta à base pública.'
                    }
                />

                <div className="listagem-painel__conteudo">
                    {carregando || carregandoCargo ? (
                        <p className="estado-carregando">Carregando EPIs…</p>
                    ) : erro ? (
                        <AreaMensagensFeedback erro={erro} onLimparErro={() => setErro('')} />
                    ) : visualizandoPorCargo ? (
                        <>
                            <TabelaEpisCargo vinculos={itensPaginados.itens} />
                            <Paginacao
                                paginaAtual={itensPaginados.paginaAtual}
                                totalPaginas={itensPaginados.totalPaginas}
                                totalItens={itensPaginados.totalItens}
                                rotuloItens="EPI(s)"
                                onPaginaAnterior={() => setPagina((atual) => Math.max(1, atual - 1))}
                                onProximaPagina={() =>
                                    setPagina((atual) => Math.min(itensPaginados.totalPaginas, atual + 1))
                                }
                            />
                        </>
                    ) : (
                        <>
                            <TabelaEpis epis={itensPaginados.itens} />
                            <Paginacao
                                paginaAtual={itensPaginados.paginaAtual}
                                totalPaginas={itensPaginados.totalPaginas}
                                totalItens={itensPaginados.totalItens}
                                rotuloItens="EPI(s)"
                                onPaginaAnterior={() => setPagina((atual) => Math.max(1, atual - 1))}
                                onProximaPagina={() =>
                                    setPagina((atual) => Math.min(itensPaginados.totalPaginas, atual + 1))
                                }
                            />
                        </>
                    )}
                </div>
            </section>
        </section>
    );
}
