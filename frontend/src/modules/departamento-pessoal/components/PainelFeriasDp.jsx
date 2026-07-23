import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { listarFeriasFuncionarios } from '../../funcionarios/services/funcionariosApi.js';
import { Paginacao } from '../../usuarios/components/Paginacao.jsx';
import {
    ORDENACOES_FERIAS_DP,
    PROXIMIDADES_FERIAS_DP,
    TAMANHOS_PAGINA_FERIAS_DP
} from '../constants/abasDepartamentoPessoal.js';
import { TabelaFeriasFuncionarios } from './TabelaFeriasFuncionarios.jsx';

const FILTROS_INICIAIS = {
    busca: '',
    ordenacao: 'proximos_vencimentos',
    proximidade: 30,
    pageSize: 25
};

function IconeFeriasDp() {
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
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

export function PainelFeriasDp() {
    const { token } = useAuth();
    const [filtrosFormulario, setFiltrosFormulario] = useState(FILTROS_INICIAIS);
    const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_INICIAIS);
    const [resultado, setResultado] = useState({ items: [], total: 0, page: 1, pageSize: 25 });
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const carregarFerias = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const resposta = await listarFeriasFuncionarios(token, {
                ...filtrosAplicados,
                page: filtrosAplicados.page || 1
            });
            setResultado(resposta);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar as férias.');
        } finally {
            setCarregando(false);
        }
    }, [token, filtrosAplicados]);

    useEffect(() => {
        carregarFerias();
    }, [carregarFerias]);

    function atualizarFiltro(campo, valor) {
        setFiltrosFormulario((atual) => ({ ...atual, [campo]: valor }));
    }

    function aplicarFiltros() {
        setFiltrosAplicados({ ...filtrosFormulario, page: 1 });
    }

    function irParaPagina(novaPagina) {
        setFiltrosAplicados((atual) => ({ ...atual, page: novaPagina }));
        setFiltrosFormulario((atual) => ({ ...atual, page: novaPagina }));
    }

    const totalPaginas = Math.max(1, Math.ceil(resultado.total / resultado.pageSize));

    return (
        <>
            <form
                className="filtros-dp filtros-dp--ferias"
                onSubmit={(evento) => {
                    evento.preventDefault();
                    aplicarFiltros();
                }}
            >
                <header className="filtros-dp__cabecalho">
                    <h3>Filtros de férias</h3>
                    <p>Busque por funcionário e refine a listagem por vencimento e paginação.</p>
                </header>

                <div className="filtros-dp__grade filtros-dp__grade--ferias">
                    <div className="campo filtros-dp__campo filtros-dp__campo--busca">
                        <label htmlFor="ferias-busca">Funcionário (nome ou CPF)</label>
                        <input
                            id="ferias-busca"
                            type="search"
                            value={filtrosFormulario.busca}
                            onChange={(evento) => atualizarFiltro('busca', evento.target.value)}
                            placeholder="Buscar por nome ou CPF…"
                        />
                    </div>

                    <div className="campo filtros-dp__campo">
                        <label htmlFor="ferias-ordenacao">Ordenação</label>
                        <select
                            id="ferias-ordenacao"
                            value={filtrosFormulario.ordenacao}
                            onChange={(evento) => atualizarFiltro('ordenacao', evento.target.value)}
                        >
                            {ORDENACOES_FERIAS_DP.map((opcao) => (
                                <option key={opcao.valor} value={opcao.valor}>
                                    {opcao.rotulo}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo filtros-dp__campo">
                        <label htmlFor="ferias-proximidade">Proximidade</label>
                        <select
                            id="ferias-proximidade"
                            value={filtrosFormulario.proximidade}
                            onChange={(evento) =>
                                atualizarFiltro('proximidade', Number(evento.target.value))
                            }
                        >
                            {PROXIMIDADES_FERIAS_DP.map((dias) => (
                                <option key={dias} value={dias}>
                                    Próximos {dias} dias
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo filtros-dp__campo">
                        <label htmlFor="ferias-pagina">Por página</label>
                        <select
                            id="ferias-pagina"
                            value={filtrosFormulario.pageSize}
                            onChange={(evento) =>
                                atualizarFiltro('pageSize', Number(evento.target.value))
                            }
                        >
                            {TAMANHOS_PAGINA_FERIAS_DP.map((tamanho) => (
                                <option key={tamanho} value={tamanho}>
                                    {tamanho}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="filtros-dp__acoes">
                    <button className="botao botao--primario" type="submit">
                        Aplicar filtros
                    </button>
                </div>
            </form>

            <section className="gerenciamento-painel listagem-painel">
                <CabecalhoListagemPainel
                    icone={<IconeFeriasDp />}
                    titulo="Férias"
                    descricao={`${resultado.total} funcionário(s) em férias com os filtros aplicados.`}
                />

                <div className="listagem-painel__conteudo">
                    {carregando ? (
                        <p className="estado-carregando">Carregando férias…</p>
                    ) : erro ? (
                        <AreaMensagensFeedback erro={erro} onLimparErro={() => setErro('')} />
                    ) : (
                        <>
                            <TabelaFeriasFuncionarios funcionarios={resultado.items} />
                            <Paginacao
                                paginaAtual={resultado.page}
                                totalPaginas={totalPaginas}
                                totalItens={resultado.total}
                                rotuloItens="funcionário(s)"
                                onPaginaAnterior={() =>
                                    irParaPagina(Math.max(1, resultado.page - 1))
                                }
                                onProximaPagina={() =>
                                    irParaPagina(Math.min(totalPaginas, resultado.page + 1))
                                }
                            />
                        </>
                    )}
                </div>
            </section>
        </>
    );
}
