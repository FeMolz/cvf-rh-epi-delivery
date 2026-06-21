import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { DialogoConfirmacao } from '../../../shared/components/DialogoConfirmacao.jsx';
import { listarCargos } from '../../cargos/services/cargosApi.js';
import { cargoEstaAtivo } from '../../cargos/utils/listagemCargos.js';
import { IconeAbaEpis } from '../components/IconeAbaEpis.jsx';
import {
    FormularioVinculoEpiPorCa,
    SeletorCargoEpis,
    TabelaEpisParaVinculo
} from '../components/FormularioVinculoEpi.jsx';
import { NavegacaoEpis } from '../components/NavegacaoEpis.jsx';
import { TabelaEpisCargo } from '../components/TabelaEpisCargo.jsx';
import { listarEpis } from '../services/episApi.js';
import {
    desvincularEpiDoCargo,
    listarEpisPorCargo,
    vincularEpiAoCargo
} from '../services/rolesEpisApi.js';
import { filtrarEpis, filtrarEpisCacheDisponiveisParaVinculo } from '../utils/listagemEpis.js';
import { erroEpiDeveSerTemporario, useMensagemTemporaria } from '../utils/mensagemErroEpi.js';
import './epis.css';

export function VinculoEpisCargoPage() {
    const { token } = useAuth();
    const [cargos, setCargos] = useState([]);
    const [episCache, setEpisCache] = useState([]);
    const [cargoSelecionadoId, setCargoSelecionadoId] = useState('');
    const [vinculosCargo, setVinculosCargo] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [carregandoVinculos, setCarregandoVinculos] = useState(false);
    const [processandoCa, setProcessandoCa] = useState(false);
    const [processandoCaNumber, setProcessandoCaNumber] = useState('');
    const { mensagem: erro, definirMensagem: definirErro, limparMensagem: limparErro } =
        useMensagemTemporaria();
    const [epiParaDesvincular, setEpiParaDesvincular] = useState('');
    const [desvinculando, setDesvinculando] = useState(false);
    const [termoBuscaCache, setTermoBuscaCache] = useState('');

    const carregarDadosIniciais = useCallback(async () => {
        setCarregando(true);
        limparErro();

        try {
            const [listaCargos, listaEpis] = await Promise.all([
                listarCargos(token, { incluirInativos: true }),
                listarEpis(token)
            ]);

            setCargos(listaCargos.filter((cargo) => cargoEstaAtivo(cargo)));
            setEpisCache(listaEpis);
        } catch (erroCapturado) {
            definirErro(erroCapturado.message || 'Não foi possível carregar os dados do módulo.');
        } finally {
            setCarregando(false);
        }
    }, [token]);

    const carregarVinculos = useCallback(async () => {
        if (!cargoSelecionadoId) {
            setVinculosCargo([]);
            return;
        }

        setCarregandoVinculos(true);
        limparErro();

        try {
            const lista = await listarEpisPorCargo(cargoSelecionadoId, token);
            setVinculosCargo(lista);
        } catch (erroCapturado) {
            definirErro(erroCapturado.message || 'Não foi possível carregar os vínculos do cargo.');
        } finally {
            setCarregandoVinculos(false);
        }
    }, [cargoSelecionadoId, token]);

    useEffect(() => {
        carregarDadosIniciais();
    }, [carregarDadosIniciais]);

    useEffect(() => {
        carregarVinculos();
    }, [carregarVinculos]);

    useEffect(() => {
        setTermoBuscaCache('');
    }, [cargoSelecionadoId]);

    const cargoSelecionado = useMemo(
        () => cargos.find((cargo) => String(cargo.id) === cargoSelecionadoId),
        [cargos, cargoSelecionadoId]
    );

    const episDisponiveis = useMemo(
        () => filtrarEpisCacheDisponiveisParaVinculo(episCache, vinculosCargo),
        [episCache, vinculosCargo]
    );

    const episDisponiveisFiltrados = useMemo(
        () => filtrarEpis(episDisponiveis, termoBuscaCache),
        [episDisponiveis, termoBuscaCache]
    );

    async function aoVincularPorCa(caNumber, periodicityDays) {
        if (!cargoSelecionadoId) {
            definirErro('Selecione um cargo antes de vincular EPIs.');
            return;
        }

        setProcessandoCa(true);
        setProcessandoCaNumber(caNumber);
        limparErro();

        try {
            await vincularEpiAoCargo(
                {
                    roleId: cargoSelecionadoId,
                    caNumber,
                    periodicityDays
                },
                token
            );

            const listaEpis = await listarEpis(token);
            setEpisCache(listaEpis);
            await carregarVinculos();
        } catch (erroCapturado) {
            const mensagem = erroCapturado.message || 'Não foi possível vincular o EPI ao cargo.';
            definirErro(mensagem, { temporario: erroEpiDeveSerTemporario(mensagem) });
        } finally {
            setProcessandoCa(false);
            setProcessandoCaNumber('');
        }
    }

    async function confirmarDesvinculo() {
        if (!cargoSelecionadoId || !epiParaDesvincular) {
            return;
        }

        setDesvinculando(true);
        limparErro();

        try {
            await desvincularEpiDoCargo(cargoSelecionadoId, epiParaDesvincular, token);
            setEpiParaDesvincular('');
            await carregarVinculos();
        } catch (erroCapturado) {
            definirErro(erroCapturado.message || 'Não foi possível desvincular o EPI.');
        } finally {
            setDesvinculando(false);
        }
    }

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>EPIs</h1>
                <p className="admin-pagina__subtitulo">
                    Selecione um cargo e vincule EPIs do cache ou consultados na base pública por CA.
                </p>
            </header>

            <NavegacaoEpis />

            <SeletorCargoEpis
                cargos={cargos}
                cargoSelecionadoId={cargoSelecionadoId}
                rotulo="Cargo para vincular EPIs"
                incluirOpcaoVazia
                onSelecionar={setCargoSelecionadoId}
            />

            {carregando ? (
                <p className="estado-carregando">Carregando opções…</p>
            ) : !cargoSelecionadoId ? (
                <p className="estado-vazio">Selecione um cargo para gerenciar os vínculos de EPI.</p>
            ) : (
                <>
                    {erro ? (
                        <p className="estado-erro" role="alert">
                            {erro}
                        </p>
                    ) : null}

                    <section className="gerenciamento-painel listagem-painel">
                        <CabecalhoListagemPainel
                            icone={<IconeAbaEpis id="vinculos" />}
                            titulo={`Vincular EPIs ao cargo ${cargoSelecionado?.name || ''}`}
                            descricao="Pesquise pelo nome na base pública ou informe o CA para vincular ao cargo."
                        />

                        <div className="listagem-painel__conteudo">
                            <FormularioVinculoEpiPorCa
                                token={token}
                                carregando={processandoCa}
                                onConsultar={aoVincularPorCa}
                            />
                        </div>
                    </section>

                    <section className="gerenciamento-painel listagem-painel">
                        <CabecalhoListagemPainel
                            icone={<IconeAbaEpis id="vinculos" />}
                            titulo="EPIs já vinculados"
                            descricao="Equipamentos atualmente associados ao cargo selecionado."
                        />

                        <div className="listagem-painel__conteudo">
                            {carregandoVinculos ? (
                                <p className="estado-carregando">Carregando vínculos…</p>
                            ) : (
                                <TabelaEpisCargo
                                    vinculos={vinculosCargo}
                                    exibirAcoes
                                    processandoId={desvinculando ? epiParaDesvincular : ''}
                                    onDesvincular={setEpiParaDesvincular}
                                />
                            )}
                        </div>
                    </section>

                    <section className="gerenciamento-painel listagem-painel">
                        <CabecalhoListagemPainel
                            icone={<IconeAbaEpis id="listagem" />}
                            titulo="EPIs em cache disponíveis"
                            descricao="Equipamentos já armazenados localmente e ainda não vinculados a este cargo."
                        />

                        <div className="listagem-painel__conteudo">
                            <div className="modulo-pesquisa">
                                <label className="campo-pesquisa campo-pesquisa--modulo">
                                    <span className="visually-hidden">Pesquisar EPIs em cache</span>
                                    <input
                                        type="search"
                                        placeholder="Buscar por nome ou CA…"
                                        value={termoBuscaCache}
                                        onChange={(evento) => setTermoBuscaCache(evento.target.value)}
                                    />
                                </label>
                            </div>

                            {episDisponiveis.length > 0 && episDisponiveisFiltrados.length === 0 ? (
                                <p className="estado-vazio">Nenhum EPI encontrado para a busca.</p>
                            ) : (
                                <TabelaEpisParaVinculo
                                    epis={episDisponiveisFiltrados}
                                    processandoCaNumber={processandoCaNumber}
                                    onVincular={aoVincularPorCa}
                                />
                            )}
                        </div>
                    </section>
                </>
            )}

            <DialogoConfirmacao
                aberto={Boolean(epiParaDesvincular)}
                titulo="Desvincular EPI"
                mensagem="Deseja remover o vínculo deste EPI com o cargo selecionado?"
                rotuloConfirmar="Desvincular"
                carregando={desvinculando}
                onConfirmar={confirmarDesvinculo}
                onCancelar={() => setEpiParaDesvincular('')}
            />
        </section>
    );
}
