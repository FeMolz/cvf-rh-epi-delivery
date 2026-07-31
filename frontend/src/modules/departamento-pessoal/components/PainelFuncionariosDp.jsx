import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { paginarLista } from '../../../shared/utils/listagemUsuarios.js';
import { TabelaFuncionarios } from '../../funcionarios/components/TabelaFuncionarios.jsx';
import { listarEmpresas } from '../../funcionarios/services/empresasApi.js';
import {
    baixarRelatorioFuncionarios,
    consultarFuncionarios
} from '../../funcionarios/services/funcionariosApi.js';
import { calcularEstatisticasFuncionarios } from '../../funcionarios/utils/listagemFuncionarios.js';
import { filtrarEmpresasAtivasParaFuncionario } from '../../funcionarios/utils/selecaoEmpresasFuncionario.js';
import { ITENS_POR_PAGINA_PADRAO, Paginacao } from '../../usuarios/components/Paginacao.jsx';
import {
    ORDENACOES_ADMISSAO_DP,
    SITUACOES_FUNCIONARIOS_DP
} from '../constants/abasDepartamentoPessoal.js';

const DEBOUNCE_BUSCA_MS = 400;

const FILTROS_INICIAIS = {
    companyId: '',
    busca: '',
    situacao: 'ativos',
    admissaoDe: '',
    admissaoAte: '',
    ordenacaoAdmissao: 'recentes'
};

function IconeFuncionariosDp() {
    return (
        <svg
            className="gerenciamento-abas__icone"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 11h-6" />
            <path d="M19 8v6" />
        </svg>
    );
}

export function PainelFuncionariosDp() {
    const { token } = useAuth();
    const [empresas, setEmpresas] = useState([]);
    const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
    const [buscaDigitada, setBuscaDigitada] = useState('');
    const [funcionarios, setFuncionarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [baixandoRelatorio, setBaixandoRelatorio] = useState(false);
    const [erro, setErro] = useState('');
    const [pagina, setPagina] = useState(1);
    const [idsSelecionados, setIdsSelecionados] = useState(() => new Set());

    useEffect(() => {
        listarEmpresas(token)
            .then((lista) => setEmpresas(filtrarEmpresasAtivasParaFuncionario(lista)))
            .catch(() => setEmpresas([]));
    }, [token]);

    useEffect(() => {
        const temporizador = setTimeout(() => {
            setFiltros((atual) => {
                if (atual.busca === buscaDigitada) {
                    return atual;
                }

                return { ...atual, busca: buscaDigitada };
            });
        }, DEBOUNCE_BUSCA_MS);

        return () => clearTimeout(temporizador);
    }, [buscaDigitada]);

    useEffect(() => {
        setPagina(1);
    }, [filtros.busca]);

    const carregarFuncionarios = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const lista = await consultarFuncionarios(token, filtros);
            setFuncionarios(lista);
            setIdsSelecionados(new Set());
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar os funcionários.');
        } finally {
            setCarregando(false);
        }
    }, [token, filtros]);

    useEffect(() => {
        carregarFuncionarios();
    }, [carregarFuncionarios]);

    const estatisticas = useMemo(
        () => calcularEstatisticasFuncionarios(funcionarios),
        [funcionarios]
    );

    const paginacao = useMemo(
        () => paginarLista(funcionarios, pagina, ITENS_POR_PAGINA_PADRAO),
        [funcionarios, pagina]
    );

    function atualizarFiltro(campo, valor) {
        setPagina(1);
        setFiltros((atual) => ({ ...atual, [campo]: valor }));
    }

    function alternarSelecaoFuncionario(id) {
        setIdsSelecionados((atual) => {
            const proximo = new Set(atual);

            if (proximo.has(id)) {
                proximo.delete(id);
            } else {
                proximo.add(id);
            }

            return proximo;
        });
    }

    function alternarSelecaoTodos(ids, selecionar) {
        setIdsSelecionados((atual) => {
            const proximo = new Set(atual);

            for (const id of ids) {
                if (selecionar) {
                    proximo.add(id);
                } else {
                    proximo.delete(id);
                }
            }

            return proximo;
        });
    }

    async function aoBaixarRelatorio() {
        setBaixandoRelatorio(true);
        setErro('');

        const idsSelecionadosLista = [...idsSelecionados];
        const opcoesRelatorio =
            idsSelecionadosLista.length > 0
                ? { ids: idsSelecionadosLista }
                : {
                      filtro: filtros.situacao === 'demitidos' ? 'inativos' : 'todos',
                      companyId: filtros.companyId || undefined
                  };

        try {
            await baixarRelatorioFuncionarios(token, opcoesRelatorio);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível baixar o relatório.');
        } finally {
            setBaixandoRelatorio(false);
        }
    }

    return (
        <>
            <div className="filtros-dp filtros-dp--funcionarios">
                <header className="filtros-dp__cabecalho">
                    <h3>Filtros de funcionários</h3>
                    <p>Refine a listagem por empresa, situação e período de admissão.</p>
                </header>

                <div className="filtros-dp__grade filtros-dp__grade--funcionarios">
                    <div className="campo filtros-dp__campo">
                        <label htmlFor="dp-funcionarios-empresa">Empresa</label>
                        <select
                            id="dp-funcionarios-empresa"
                            value={filtros.companyId}
                            onChange={(evento) => atualizarFiltro('companyId', evento.target.value)}
                        >
                            <option value="">Todas as empresas</option>
                            {empresas.map((empresa) => (
                                <option key={empresa.id} value={empresa.id}>
                                    {empresa.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo filtros-dp__campo filtros-dp__campo--busca">
                        <label htmlFor="dp-funcionarios-busca">Funcionário (nome ou CPF)</label>
                        <input
                            id="dp-funcionarios-busca"
                            type="search"
                            value={buscaDigitada}
                            onChange={(evento) => setBuscaDigitada(evento.target.value)}
                            placeholder="Buscar por nome ou CPF…"
                        />
                    </div>

                    <div className="campo filtros-dp__campo">
                        <label htmlFor="dp-funcionarios-situacao">Situação</label>
                        <select
                            id="dp-funcionarios-situacao"
                            value={filtros.situacao}
                            onChange={(evento) => atualizarFiltro('situacao', evento.target.value)}
                        >
                            {SITUACOES_FUNCIONARIOS_DP.map((opcao) => (
                                <option key={opcao.valor} value={opcao.valor}>
                                    {opcao.rotulo}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo filtros-dp__campo">
                        <label htmlFor="dp-funcionarios-admissao-de">Admissão de</label>
                        <input
                            id="dp-funcionarios-admissao-de"
                            type="date"
                            value={filtros.admissaoDe}
                            onChange={(evento) => atualizarFiltro('admissaoDe', evento.target.value)}
                        />
                    </div>

                    <div className="campo filtros-dp__campo">
                        <label htmlFor="dp-funcionarios-admissao-ate">Admissão até</label>
                        <input
                            id="dp-funcionarios-admissao-ate"
                            type="date"
                            value={filtros.admissaoAte}
                            onChange={(evento) => atualizarFiltro('admissaoAte', evento.target.value)}
                        />
                    </div>

                    <div className="campo filtros-dp__campo">
                        <label htmlFor="dp-funcionarios-ordenacao">Ordenação por admissão</label>
                        <select
                            id="dp-funcionarios-ordenacao"
                            value={filtros.ordenacaoAdmissao}
                            onChange={(evento) =>
                                atualizarFiltro('ordenacaoAdmissao', evento.target.value)
                            }
                        >
                            {ORDENACOES_ADMISSAO_DP.map((opcao) => (
                                <option key={opcao.valor} value={opcao.valor}>
                                    {opcao.rotulo}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <section className="gerenciamento-painel listagem-painel">
                <CabecalhoListagemPainel
                    icone={<IconeFuncionariosDp />}
                    titulo="Funcionários"
                    descricao={`${estatisticas.total} funcionário(s) encontrado(s) com os filtros aplicados.`}
                    acoes={
                        <button
                            className="botao botao--primario"
                            type="button"
                            disabled={baixandoRelatorio || carregando}
                            onClick={aoBaixarRelatorio}
                        >
                            {baixandoRelatorio ? 'Baixando…' : 'Download relatório'}
                        </button>
                    }
                />

                <div className="listagem-painel__conteudo">
                    {carregando ? (
                        <p className="estado-carregando">Carregando funcionários…</p>
                    ) : erro ? (
                        <AreaMensagensFeedback erro={erro} onLimparErro={() => setErro('')} />
                    ) : (
                        <>
                            <TabelaFuncionarios
                                funcionarios={paginacao.itens}
                                idsSelecionados={idsSelecionados}
                                onAlternarSelecao={alternarSelecaoFuncionario}
                                onAlternarSelecaoTodos={alternarSelecaoTodos}
                            />
                            <Paginacao
                                paginaAtual={paginacao.paginaAtual}
                                totalPaginas={paginacao.totalPaginas}
                                totalItens={paginacao.totalItens}
                                rotuloItens="funcionário(s)"
                                onPaginaAnterior={() => setPagina((atual) => Math.max(1, atual - 1))}
                                onProximaPagina={() =>
                                    setPagina((atual) => Math.min(paginacao.totalPaginas, atual + 1))
                                }
                            />
                        </>
                    )}
                </div>
            </section>
        </>
    );
}
