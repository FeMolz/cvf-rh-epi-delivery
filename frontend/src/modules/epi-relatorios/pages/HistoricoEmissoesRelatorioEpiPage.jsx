import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { IconeModulo } from '../../../shared/components/IconeModulo.jsx';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { FiltrosHistoricoEmissoes } from '../components/FiltrosHistoricoEmissoes.jsx';
import { usuarioPodeGerenciarRelatoriosEpi } from '../components/FormularioEmitirRelatorio.jsx';
import { TabelaRelatoriosEntrega } from '../components/TabelaRelatoriosEntrega.jsx';
import {
    atualizarFlagsRelatorioEntregaEpi,
    baixarPdfRelatorioEntregaEpi,
    listarArquivoRelatoriosFuncionario,
    listarFuncionariosComHistoricoEmissoes,
    listarRelatoriosEntregaEpi
} from '../services/epiRelatoriosApi.js';
import { obterFlagsParaStatusDocumento } from '../utils/statusDocumentoRelatorio.js';
import './relatoriosEntregaEpi.css';

const FILTROS_INICIAIS = {
    employeeId: '',
    emissaoInicio: '',
    emissaoFim: ''
};

export function HistoricoEmissoesRelatorioEpiPage() {
    const { token, user } = useAuth();
    const podeGerenciar = usuarioPodeGerenciarRelatoriosEpi(user?.role);

    const [carregandoFuncionarios, setCarregandoFuncionarios] = useState(true);
    const [processandoBusca, setProcessandoBusca] = useState(false);
    const [relatorioProcessandoId, setRelatorioProcessandoId] = useState('');
    const [relatorioBaixandoId, setRelatorioBaixandoId] = useState('');
    const [relatoriosComDownload, setRelatoriosComDownload] = useState(() => new Set());
    const [erro, setErro] = useState('');
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    const [funcionarios, setFuncionarios] = useState([]);
    const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
    const [relatorios, setRelatorios] = useState([]);

    const funcionarioSelecionado = useMemo(
        () => funcionarios.find((funcionario) => funcionario.id === filtros.employeeId),
        [funcionarios, filtros.employeeId]
    );

    const carregarFuncionarios = useCallback(async () => {
        const lista = await listarFuncionariosComHistoricoEmissoes(token);
        setFuncionarios(lista || []);
    }, [token]);

    const montarRelatoriosComFuncionario = useCallback(
        (itens) => {
            const funcionario = funcionarioSelecionado;

            return (itens || []).map((relatorio) => ({
                ...relatorio,
                employee: {
                    name: funcionario?.name,
                    role: { name: funcionario?.roleName }
                }
            }));
        },
        [funcionarioSelecionado]
    );

    const buscarEmissoes = useCallback(async () => {
        if (!filtros.employeeId) {
            setErro('Selecione um funcionário para consultar o histórico.');
            return;
        }

        if (
            (filtros.emissaoInicio && !filtros.emissaoFim) ||
            (!filtros.emissaoInicio && filtros.emissaoFim)
        ) {
            setErro('Informe o início e o fim do período para filtrar por data.');
            return;
        }

        setProcessandoBusca(true);
        setErro('');

        try {
            if (filtros.emissaoInicio && filtros.emissaoFim) {
                const resultado = await listarRelatoriosEntregaEpi(token, {
                    employeeId: filtros.employeeId,
                    emissaoInicio: filtros.emissaoInicio,
                    emissaoFim: filtros.emissaoFim,
                    limite: 100
                });

                setRelatorios(montarRelatoriosComFuncionario(resultado.itens));
            } else {
                const arquivo = await listarArquivoRelatoriosFuncionario(filtros.employeeId, token);
                setRelatorios(montarRelatoriosComFuncionario(arquivo));
            }

            setBuscaRealizada(true);
        } catch (erroCapturado) {
            setRelatorios([]);
            setBuscaRealizada(false);
            setErro(erroCapturado.message || 'Não foi possível carregar as emissões.');
        } finally {
            setProcessandoBusca(false);
        }
    }, [token, filtros, montarRelatoriosComFuncionario]);

    useEffect(() => {
        async function iniciar() {
            setErro('');

            try {
                await carregarFuncionarios();
            } catch (erroCapturado) {
                setErro(erroCapturado.message || 'Não foi possível carregar os funcionários.');
            } finally {
                setCarregandoFuncionarios(false);
            }
        }

        iniciar();
    }, [carregarFuncionarios]);

    function alterarFiltro(campo, valor) {
        setBuscaRealizada(false);
        setRelatorios([]);
        setFiltros((atual) => ({ ...atual, [campo]: valor }));
    }

    function limparFiltros() {
        setBuscaRealizada(false);
        setRelatorios([]);
        setFiltros(FILTROS_INICIAIS);
        setErro('');
    }

    async function aoAlterarStatus(relatorioId, statusId) {
        setRelatorioProcessandoId(relatorioId);
        setErro('');

        try {
            const atualizado = await atualizarFlagsRelatorioEntregaEpi(
                relatorioId,
                obterFlagsParaStatusDocumento(statusId),
                token
            );

            setRelatorios((atual) =>
                atual.map((relatorio) =>
                    relatorio.id === relatorioId
                        ? {
                              ...relatorio,
                              ...atualizado,
                              employee: relatorio.employee
                          }
                        : relatorio
                )
            );
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível atualizar o status do documento.');
        } finally {
            setRelatorioProcessandoId('');
        }
    }

    async function aoBaixarPdf(relatorioId) {
        setRelatorioBaixandoId(relatorioId);
        setErro('');

        try {
            await baixarPdfRelatorioEntregaEpi(relatorioId, token);
            setRelatoriosComDownload((atual) => new Set(atual).add(relatorioId));
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível baixar o PDF.');
        } finally {
            setRelatorioBaixandoId('');
        }
    }

    return (
        <>
            {carregandoFuncionarios ? (
                <p className="estado-carregando">Carregando funcionários…</p>
            ) : (
                <>
                    <AreaMensagensFeedback erro={erro} onLimparErro={() => setErro('')} />

                    <section className="gerenciamento-painel listagem-painel">
                        <CabecalhoListagemPainel
                            icone={<IconeModulo id="epi-reports" />}
                            titulo="Histórico de emissões"
                            descricao="Selecione o funcionário e, se desejar, um período de emissão para consultar os relatórios gerados."
                        />

                        <div className="listagem-painel__conteudo">
                            <FiltrosHistoricoEmissoes
                                funcionarios={funcionarios}
                                employeeId={filtros.employeeId}
                                emissaoInicio={filtros.emissaoInicio}
                                emissaoFim={filtros.emissaoFim}
                                processando={processandoBusca}
                                onAlterarEmployeeId={(valor) => alterarFiltro('employeeId', valor)}
                                onAlterarEmissaoInicio={(valor) => alterarFiltro('emissaoInicio', valor)}
                                onAlterarEmissaoFim={(valor) => alterarFiltro('emissaoFim', valor)}
                                onBuscar={buscarEmissoes}
                                onLimpar={limparFiltros}
                            />

                            {!buscaRealizada ? (
                                <p className="estado-vazio epi-relatorios__historico-vazio">
                                    Selecione um funcionário e clique em Buscar emissões para visualizar o
                                    histórico.
                                </p>
                            ) : processandoBusca ? (
                                <p className="estado-carregando">Carregando emissões…</p>
                            ) : (
                                <TabelaRelatoriosEntrega
                                    relatorios={relatorios}
                                    paginaAtual={1}
                                    totalPaginas={1}
                                    totalItens={relatorios.length}
                                    podeEditarStatus={podeGerenciar}
                                    relatorioProcessandoId={relatorioProcessandoId}
                                    relatorioBaixandoId={relatorioBaixandoId}
                                    relatoriosComDownload={relatoriosComDownload}
                                    /* v8 ignore next 2 */
                                    onPaginaAnterior={() => {}}
                                    onProximaPagina={() => {}}
                                    onAlterarStatus={aoAlterarStatus}
                                    onBaixarPdf={aoBaixarPdf}
                                />
                            )}
                        </div>
                    </section>
                </>
            )}
        </>
    );
}
