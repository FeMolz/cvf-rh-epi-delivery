import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { IconeModulo } from '../../../shared/components/IconeModulo.jsx';
import { FormularioEntregaEpi } from '../components/FormularioEntregaEpi.jsx';
import { NavegacaoEntregasEpi } from '../components/NavegacaoEntregasEpi.jsx';
import { TabelaEpisFuncionarioEntrega } from '../components/TabelaEpisFuncionarioEntrega.jsx';
import { TabelaFuncionariosEpi } from '../components/TabelaFuncionariosEpi.jsx';
import {
    buscarPainelEntregasEpi,
    buscarSituacaoEpisFuncionario,
    registrarEntregaEpi
} from '../services/epiEntregasApi.js';
import { listarEpis } from '../../epis/services/episApi.js';
import { obterDataIsoHoje } from '../utils/dataEntregaEpi.js';
import '../../epis/pages/epis.css';
import './entregasEpi.css';

export function RegistroEntregaEpiPage() {
    const { token } = useAuth();
    const [carregando, setCarregando] = useState(true);
    const [processando, setProcessando] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [funcionariosElegiveis, setFuncionariosElegiveis] = useState([]);
    const [funcionarioSelecionadoId, setFuncionarioSelecionadoId] = useState('');
    const [episFuncionario, setEpisFuncionario] = useState([]);
    const [episCache, setEpisCache] = useState([]);
    const [episSelecionados, setEpisSelecionados] = useState([]);
    const [dataEntrega, setDataEntrega] = useState(() => obterDataIsoHoje());

    const funcionarioSelecionado = useMemo(
        () => funcionariosElegiveis.find((funcionario) => funcionario.id === funcionarioSelecionadoId),
        [funcionariosElegiveis, funcionarioSelecionadoId]
    );

    const carregarPainel = useCallback(async () => {
        const [painel, listaEpis] = await Promise.all([
            buscarPainelEntregasEpi(token),
            listarEpis(token)
        ]);
        setFuncionariosElegiveis(painel.funcionariosElegiveis || []);
        setEpisCache(listaEpis || []);
    }, [token]);

    const carregarSituacaoFuncionario = useCallback(
        async (employeeId) => {
            /* v8 ignore next 4 */
            if (!employeeId) {
                setEpisFuncionario([]);
                return;
            }

            const situacao = await buscarSituacaoEpisFuncionario(employeeId, token);
            setEpisFuncionario(situacao.epis || []);
        },
        [token]
    );

    const recarregarDados = useCallback(async () => {
        await carregarPainel();

        if (funcionarioSelecionadoId) {
            await carregarSituacaoFuncionario(funcionarioSelecionadoId);
        }
    }, [carregarPainel, carregarSituacaoFuncionario, funcionarioSelecionadoId]);

    useEffect(() => {
        async function iniciar() {
            setCarregando(true);
            setErro('');

            try {
                await carregarPainel();
            } catch (erroCapturado) {
                setErro(erroCapturado.message || 'Não foi possível carregar o painel de entregas.');
            } finally {
                setCarregando(false);
            }
        }

        iniciar();
    }, [carregarPainel]);

    useEffect(() => {
        async function atualizarSituacao() {
            if (!funcionarioSelecionadoId) {
                setEpisFuncionario([]);
                setEpisSelecionados([]);
                return;
            }

            setErro('');

            try {
                await carregarSituacaoFuncionario(funcionarioSelecionadoId);
                setEpisSelecionados([]);
            } catch (erroCapturado) {
                setErro(
                    erroCapturado.message || 'Não foi possível carregar os EPIs do funcionário.'
                );
            }
        }

        atualizarSituacao();
    }, [funcionarioSelecionadoId, carregarSituacaoFuncionario]);

    function aoSelecionarFuncionario(employeeId) {
        setMensagemSucesso('');
        setFuncionarioSelecionadoId(employeeId);
    }

    function aoAlternarEpi(caNumber) {
        setEpisSelecionados((atual) =>
            atual.includes(caNumber)
                ? atual.filter((ca) => ca !== caNumber)
                : [...atual, caNumber]
        );
    }

    async function aoEntregar() {
        if (!funcionarioSelecionadoId || !episSelecionados.length) {
            setErro('Selecione um funcionário e ao menos um EPI para entregar.');
            return;
        }

        if (!dataEntrega) {
            setErro('Informe a data da entrega.');
            return;
        }

        setProcessando(true);
        setErro('');
        setMensagemSucesso('');

        try {
            const resultado = await registrarEntregaEpi(
                {
                    employeeId: funcionarioSelecionadoId,
                    caNumbers: episSelecionados,
                    deliveryDate: dataEntrega
                },
                token
            );

            setMensagemSucesso(resultado.message || 'Entrega registrada com sucesso.');
            setEpisSelecionados([]);
            await recarregarDados();
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível registrar a entrega.');
        } finally {
            setProcessando(false);
        }
    }

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Entregas de EPI</h1>
                <p className="admin-pagina__subtitulo">
                    Registre entregas com data escolhida e acompanhe a situação dos EPIs por funcionário.
                </p>
            </header>

            <NavegacaoEntregasEpi />

            {carregando ? (
                <p className="estado-carregando">Carregando painel de entregas…</p>
            ) : (
                <>
                    <AreaMensagensFeedback
                        erro={erro}
                        sucesso={mensagemSucesso}
                        onLimparErro={() => setErro('')}
                        onLimparSucesso={() => setMensagemSucesso('')}
                    />

                    <section className="gerenciamento-painel listagem-painel">
                        <CabecalhoListagemPainel
                            icone={<IconeModulo id="epi-deliveries" />}
                            titulo="Registrar entrega"
                            descricao="Selecione o funcionário, a data, marque os EPIs desejados e confirme a entrega."
                        />

                        <div className="listagem-painel__conteudo">
                            <FormularioEntregaEpi
                                token={token}
                                funcionarios={funcionariosElegiveis}
                                epis={episFuncionario}
                                episCache={episCache}
                                funcionarioSelecionadoId={funcionarioSelecionadoId}
                                episSelecionados={episSelecionados}
                                dataEntrega={dataEntrega}
                                carregando={processando}
                                onSelecionarFuncionario={aoSelecionarFuncionario}
                                onAlterarDataEntrega={setDataEntrega}
                                onAlternarEpi={aoAlternarEpi}
                                onEntregar={aoEntregar}
                            />
                        </div>
                    </section>

                    <section className="gerenciamento-painel listagem-painel">
                        <CabecalhoListagemPainel
                            icone={<IconeModulo id="employees" />}
                            titulo={
                                funcionarioSelecionadoId
                                    ? `EPIs do funcionário ${funcionarioSelecionado?.name || ''}`
                                    : 'Funcionários ativos'
                            }
                            descricao={
                                funcionarioSelecionadoId
                                    ? episFuncionario.length
                                        ? 'Situação e validades dos EPIs vinculados ao cargo.'
                                        : 'Cargo sem EPIs vinculados — use a busca na base pública ou o cache para registrar entregas.'
                                    : 'Todos os funcionários ativos. Selecione um nome para ver os EPIs do cargo ou registrar entrega.'
                            }
                        />

                        <div className="listagem-painel__conteudo">
                            {funcionarioSelecionadoId ? (
                                <TabelaEpisFuncionarioEntrega
                                    epis={episFuncionario}
                                    nomeFuncionario={funcionarioSelecionado?.name}
                                />
                            ) : (
                                <TabelaFuncionariosEpi
                                    funcionarios={funcionariosElegiveis}
                                    funcionarioSelecionadoId={funcionarioSelecionadoId}
                                    onSelecionar={aoSelecionarFuncionario}
                                />
                            )}
                        </div>
                    </section>
                </>
            )}
        </section>
    );
}
