import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { IconeModulo } from '../../../shared/components/IconeModulo.jsx';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { usuarioPodeGerenciarRelatoriosEpi } from '../components/FormularioEmitirRelatorio.jsx';
import { FiltrosRelatoriosEntrega } from '../components/FiltrosRelatoriosEntrega.jsx';
import { TabelaRelatoriosEntrega } from '../components/TabelaRelatoriosEntrega.jsx';
import { ITENS_POR_PAGINA_RELATORIOS_EPI, DIAS_JANELA_ULTIMAS_EMISSOES_RELATORIO } from '../constants/paginacaoRelatoriosEpi.js';
import {
    atualizarFlagsRelatorioEntregaEpi,
    baixarPdfRelatorioEntregaEpi,
    listarFuncionariosComHistoricoEmissoes,
    listarRelatoriosEntregaEpi
} from '../services/epiRelatoriosApi.js';
import { obterFlagsParaStatusDocumento } from '../utils/statusDocumentoRelatorio.js';
import './relatoriosEntregaEpi.css';

const FILTROS_INICIAIS = {
    employeeId: '',
    situacaoAssinatura: ''
};

export function UltimasEmissoesRelatorioEpiPage() {
    const { token, user } = useAuth();
    const podeGerenciar = usuarioPodeGerenciarRelatoriosEpi(user?.role);

    const [carregando, setCarregando] = useState(true);
    const [relatorioProcessandoId, setRelatorioProcessandoId] = useState('');
    const [relatorioBaixandoId, setRelatorioBaixandoId] = useState('');
    const [relatoriosComDownload, setRelatoriosComDownload] = useState(() => new Set());
    const [erro, setErro] = useState('');

    const [funcionarios, setFuncionarios] = useState([]);
    const [relatorios, setRelatorios] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalItens, setTotalItens] = useState(0);
    const [filtros, setFiltros] = useState(FILTROS_INICIAIS);

    const funcionariosParaSelect = useMemo(
        () =>
            funcionarios.map((funcionario) => ({
                id: funcionario.id,
                name: funcionario.name,
                roleName: funcionario.roleName
            })),
        [funcionarios]
    );

    const carregarFuncionarios = useCallback(async () => {
        const lista = await listarFuncionariosComHistoricoEmissoes(token);
        setFuncionarios(lista || []);
    }, [token]);

    const carregarRelatorios = useCallback(async () => {
        const resultado = await listarRelatoriosEntregaEpi(token, {
            employeeId: filtros.employeeId || undefined,
            foiAssinado: filtros.situacaoAssinatura,
            ultimosDias: DIAS_JANELA_ULTIMAS_EMISSOES_RELATORIO,
            pagina: paginaAtual,
            limite: ITENS_POR_PAGINA_RELATORIOS_EPI
        });

        setRelatorios(resultado.itens || []);
        setPaginaAtual(resultado.pagina || 1);
        setTotalPaginas(resultado.totalPaginas || 1);
        setTotalItens(resultado.totalItens || 0);
    }, [token, filtros, paginaAtual]);

    useEffect(() => {
        async function iniciar() {
            setErro('');

            try {
                await carregarFuncionarios();
            } catch (erroCapturado) {
                setErro(erroCapturado.message || 'Não foi possível carregar os funcionários.');
            }
        }

        iniciar();
    }, [carregarFuncionarios]);

    useEffect(() => {
        async function atualizarLista() {
            setCarregando(true);
            setErro('');

            try {
                await carregarRelatorios();
            } catch (erroCapturado) {
                setErro(erroCapturado.message || 'Não foi possível carregar os relatórios.');
            } finally {
                setCarregando(false);
            }
        }

        atualizarLista();
    }, [carregarRelatorios]);

    function alterarFiltro(campo, valor) {
        setPaginaAtual(1);
        setFiltros((atual) => ({ ...atual, [campo]: valor }));
    }

    function limparFiltros() {
        setPaginaAtual(1);
        setFiltros(FILTROS_INICIAIS);
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
                    relatorio.id === relatorioId ? { ...relatorio, ...atualizado } : relatorio
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
            {carregando ? (
                <p className="estado-carregando">Carregando relatórios…</p>
            ) : (
                <>
                    <AreaMensagensFeedback erro={erro} onLimparErro={() => setErro('')} />

                    <section className="gerenciamento-painel listagem-painel">
                        <CabecalhoListagemPainel
                            icone={<IconeModulo id="epi-reports" />}
                            titulo="Últimas emissões"
                            descricao={`Emissões dos últimos ${DIAS_JANELA_ULTIMAS_EMISSOES_RELATORIO} dias. Filtre por funcionário ou situação do documento.`}
                        />

                        <div className="listagem-painel__conteudo">
                            <FiltrosRelatoriosEntrega
                                funcionarios={funcionariosParaSelect}
                                employeeId={filtros.employeeId}
                                situacaoAssinatura={filtros.situacaoAssinatura}
                                onAlterarEmployeeId={(valor) => alterarFiltro('employeeId', valor)}
                                onAlterarSituacaoAssinatura={(valor) =>
                                    alterarFiltro('situacaoAssinatura', valor)
                                }
                                onLimpar={limparFiltros}
                            />

                            <TabelaRelatoriosEntrega
                                relatorios={relatorios}
                                paginaAtual={paginaAtual}
                                totalPaginas={totalPaginas}
                                totalItens={totalItens}
                                podeEditarStatus={podeGerenciar}
                                relatorioProcessandoId={relatorioProcessandoId}
                                relatorioBaixandoId={relatorioBaixandoId}
                                relatoriosComDownload={relatoriosComDownload}
                                onPaginaAnterior={() =>
                                    setPaginaAtual((atual) => Math.max(1, atual - 1))
                                }
                                onProximaPagina={() =>
                                    setPaginaAtual((atual) => Math.min(totalPaginas, atual + 1))
                                }
                                onAlterarStatus={aoAlterarStatus}
                                onBaixarPdf={aoBaixarPdf}
                            />
                        </div>
                    </section>
                </>
            )}
        </>
    );
}
