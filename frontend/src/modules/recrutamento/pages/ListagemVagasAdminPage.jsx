import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AbasModulo } from '../../../shared/components/AbasModulo.jsx';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { IconeAbaRecrutamento } from '../components/IconeAbaRecrutamento.jsx';
import { PainelCandidaturasAdmin } from '../components/PainelCandidaturasAdmin.jsx';
import { PainelProcessoAprovacao } from '../components/PainelProcessoAprovacao.jsx';
import { SeletorFiltroStatusCandidatura } from '../components/SeletorFiltroStatusCandidatura.jsx';
import { SeletorOrdenacaoCandidatura } from '../components/SeletorOrdenacaoCandidatura.jsx';
import { SeletorVagaCandidaturas } from '../components/SeletorVagaCandidaturas.jsx';
import { TabelaVagas } from '../components/TabelaVagas.jsx';
import {
    ABAS_MODULO_RECRUTAMENTO,
    ABAS_VAGAS_ADMIN,
    ORDENACAO_CANDIDATURAS,
    STATUS_ANUNCIO_VAGA
} from '../constants/recrutamentoConstantes.js';
import { atualizarStatusVaga, listarVagasAdmin } from '../services/recrutamentoApi.js';
import { filtrarVagasPorTermo } from '../utils/formatarRecrutamento.js';
import './recrutamento.css';

export function ListagemVagasAdminPage() {
    const { token } = useAuth();
    const [abaModulo, setAbaModulo] = useState('vagas');
    const [abaAtiva, setAbaAtiva] = useState('ATIVA');
    const [vagaSelecionada, setVagaSelecionada] = useState('');
    const [statusSelecionado, setStatusSelecionado] = useState('');
    const [ordenacao, setOrdenacao] = useState(ORDENACAO_CANDIDATURAS.RECENTES);
    const [vagas, setVagas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [processandoVagaId, setProcessandoVagaId] = useState('');
    const [termoBusca, setTermoBusca] = useState('');

    const carregarVagas = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const lista = await listarVagasAdmin(token, { status: abaAtiva });
            setVagas(lista);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar as vagas.');
        } finally {
            setCarregando(false);
        }
    }, [token, abaAtiva]);

    useEffect(() => {
        if (abaModulo === 'vagas') {
            carregarVagas();
        }
    }, [carregarVagas, abaModulo]);

    async function publicarVaga(vagaId) {
        setProcessandoVagaId(vagaId);
        setErro('');
        setSucesso('');

        try {
            await atualizarStatusVaga(vagaId, STATUS_ANUNCIO_VAGA.ATIVA, token);
            setSucesso('Vaga publicada com sucesso.');
            await carregarVagas();
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível publicar a vaga.');
        } finally {
            setProcessandoVagaId('');
        }
    }

    async function encerrarVaga(vagaId) {
        setProcessandoVagaId(vagaId);
        setErro('');
        setSucesso('');

        try {
            await atualizarStatusVaga(vagaId, STATUS_ANUNCIO_VAGA.ENCERRADA, token);
            setSucesso('Vaga encerrada com sucesso.');
            await carregarVagas();
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível encerrar a vaga.');
        } finally {
            setProcessandoVagaId('');
        }
    }

    const vagasFiltradas = useMemo(
        () => filtrarVagasPorTermo(vagas, termoBusca),
        [vagas, termoBusca]
    );

    const tituloAba =
        abaAtiva === 'ATIVA' ? 'Vagas ativas' : abaAtiva === 'INATIVA' ? 'Rascunhos' : 'Vagas encerradas';

    const abasModuloComIcone = ABAS_MODULO_RECRUTAMENTO.map((aba) => ({
        ...aba,
        icone: (
            <IconeAbaRecrutamento
                id={
                    aba.id === 'candidaturas'
                        ? 'candidaturas'
                        : aba.id === 'processo-aprovacao'
                          ? 'processo-aprovacao'
                          : aba.id === 'lixeira'
                            ? 'lixeira'
                            : aba.id === 'reativados'
                              ? 'reativados'
                              : 'ativas'
                }
            />
        )
    }));

    const abasComIcone = ABAS_VAGAS_ADMIN.map((aba) => ({
        ...aba,
        icone: <IconeAbaRecrutamento id={aba.id} />
    }));

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho admin-pagina__cabecalho--com-acoes">
                <div>
                    <h1>Recrutamento</h1>
                    <p className="admin-pagina__subtitulo">
                        Crie, edite e gerencie anúncios de vagas e acompanhe as candidaturas recebidas.
                    </p>
                </div>
                <div className="admin-pagina__acoes">
                    <Link
                        className="botao botao--secundario"
                        to="/publico/vagas"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Página de vagas
                    </Link>
                    <Link className="botao botao--primario" to="/admin/recrutamento/nova">
                        Nova vaga
                    </Link>
                </div>
            </header>

            <AbasModulo
                abas={abasModuloComIcone}
                abaAtiva={abaModulo}
                rotuloAria="Seções do módulo de recrutamento"
                onTrocarAba={setAbaModulo}
            />

            {abaModulo === 'vagas' ? (
                <>
                    <AbasModulo
                        abas={abasComIcone}
                        abaAtiva={abaAtiva}
                        rotuloAria="Situação das vagas"
                        onTrocarAba={setAbaAtiva}
                    />

                    <div className="modulo-pesquisa">
                        <label className="campo-pesquisa campo-pesquisa--modulo">
                            <span className="visually-hidden">Pesquisar vagas</span>
                            <input
                                type="search"
                                placeholder="Buscar por título ou local…"
                                value={termoBusca}
                                onChange={(evento) => setTermoBusca(evento.target.value)}
                            />
                        </label>
                    </div>

                    <section className="gerenciamento-painel listagem-painel">
                        <CabecalhoListagemPainel
                            icone={<IconeAbaRecrutamento id={abaAtiva} />}
                            titulo={tituloAba}
                            descricao={`${vagasFiltradas.length} vaga(s) encontrada(s).`}
                        />

                        <div className="listagem-painel__conteudo">
                            <AreaMensagensFeedback
                                erro={erro}
                                sucesso={sucesso}
                                onLimparErro={() => setErro('')}
                                onLimparSucesso={() => setSucesso('')}
                            />

                            {carregando ? (
                                <p className="estado-carregando">Carregando vagas…</p>
                            ) : (
                                <TabelaVagas
                                    vagas={vagasFiltradas}
                                    processandoVagaId={processandoVagaId}
                                    onPublicarVaga={
                                        abaAtiva === STATUS_ANUNCIO_VAGA.INATIVA ? publicarVaga : undefined
                                    }
                                    onEncerrarVaga={
                                        abaAtiva === STATUS_ANUNCIO_VAGA.ATIVA ? encerrarVaga : undefined
                                    }
                                />
                            )}
                        </div>
                    </section>
                </>
            ) : abaModulo === 'reativados' ? (
                <PainelCandidaturasAdmin token={token} modoReativados />
            ) : abaModulo === 'processo-aprovacao' ? (
                <PainelProcessoAprovacao token={token} />
            ) : (
                <>
                    {abaModulo === 'candidaturas' ? (
                        <div className="modulo-pesquisa modulo-pesquisa--filtros-candidaturas">
                            <SeletorVagaCandidaturas
                                token={token}
                                valor={vagaSelecionada}
                                onChange={setVagaSelecionada}
                            />
                            <SeletorFiltroStatusCandidatura
                                valor={statusSelecionado}
                                onChange={setStatusSelecionado}
                            />
                            <SeletorOrdenacaoCandidatura
                                valor={ordenacao}
                                onChange={setOrdenacao}
                            />
                        </div>
                    ) : (
                        <div className="modulo-pesquisa modulo-pesquisa--filtro-vaga">
                            <SeletorVagaCandidaturas
                                token={token}
                                valor={vagaSelecionada}
                                onChange={setVagaSelecionada}
                            />
                        </div>
                    )}

                    <PainelCandidaturasAdmin
                        token={token}
                        anuncioVagaId={vagaSelecionada}
                        statusFiltro={abaModulo === 'candidaturas' ? statusSelecionado : ''}
                        ordenacao={abaModulo === 'candidaturas' ? ordenacao : ''}
                        exibirColunaVaga={!vagaSelecionada}
                        modoLixeira={abaModulo === 'lixeira'}
                    />
                </>
            )}
        </section>
    );
}
