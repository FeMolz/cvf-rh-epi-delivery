import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AbasModulo } from '../../../shared/components/AbasModulo.jsx';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { paginarLista } from '../../../shared/utils/listagemUsuarios.js';
import { ITENS_POR_PAGINA_PADRAO, Paginacao } from '../../usuarios/components/Paginacao.jsx';
import { EstatisticasFuncionarios } from '../components/EstatisticasFuncionarios.jsx';
import { TabelaFuncionarios } from '../components/TabelaFuncionarios.jsx';
import { listarEmpresas } from '../services/empresasApi.js';
import {
    baixarRelatorioFuncionarios,
    listarFuncionarios
} from '../services/funcionariosApi.js';
import {
    calcularEstatisticasFuncionarios,
    filtrarFuncionarios,
    filtrarFuncionariosPorEmpresa
} from '../utils/listagemFuncionarios.js';
import { filtrarEmpresasAtivasParaFuncionario } from '../utils/selecaoEmpresasFuncionario.js';

function IconeEmpresaFuncionarios() {
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
            <path d="M3 21h18" />
            <path d="M6 21V7l6-4 6 4v14" />
            <path d="M10 11h4" />
            <path d="M10 15h4" />
        </svg>
    );
}

export function ListagemFuncionariosPage() {
    const { token } = useAuth();
    const [empresas, setEmpresas] = useState([]);
    const [empresaAtivaId, setEmpresaAtivaId] = useState('');
    const [funcionarios, setFuncionarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [baixandoRelatorio, setBaixandoRelatorio] = useState(false);
    const [erro, setErro] = useState('');
    const [termoBusca, setTermoBusca] = useState('');
    const [pagina, setPagina] = useState(1);
    const [idsSelecionados, setIdsSelecionados] = useState(() => new Set());

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const [listaEmpresas, listaFuncionarios] = await Promise.all([
                listarEmpresas(token),
                listarFuncionarios(token, { filtro: 'todos' })
            ]);

            setEmpresas(filtrarEmpresasAtivasParaFuncionario(listaEmpresas));
            setFuncionarios(listaFuncionarios);
            setEmpresaAtivaId((atual) => {
                const empresasAtivas = filtrarEmpresasAtivasParaFuncionario(listaEmpresas);

                if (atual && empresasAtivas.some((empresa) => empresa.id === atual)) {
                    return atual;
                }

                return empresasAtivas[0]?.id ? String(empresasAtivas[0].id) : '';
            });
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar os funcionários.');
        } finally {
            setCarregando(false);
        }
    }, [token]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const empresaAtiva = useMemo(
        () => empresas.find((empresa) => String(empresa.id) === empresaAtivaId),
        [empresas, empresaAtivaId]
    );

    const funcionariosDaEmpresa = useMemo(
        () => filtrarFuncionariosPorEmpresa(funcionarios, empresaAtivaId),
        [funcionarios, empresaAtivaId]
    );

    const estatisticas = useMemo(
        () => calcularEstatisticasFuncionarios(funcionariosDaEmpresa),
        [funcionariosDaEmpresa]
    );

    const funcionariosFiltrados = useMemo(
        () => filtrarFuncionarios(funcionariosDaEmpresa, termoBusca),
        [funcionariosDaEmpresa, termoBusca]
    );

    const paginacao = useMemo(
        () => paginarLista(funcionariosFiltrados, pagina, ITENS_POR_PAGINA_PADRAO),
        [funcionariosFiltrados, pagina]
    );

    const abasEmpresas = useMemo(
        () =>
            empresas.map((empresa) => ({
                id: String(empresa.id),
                rotulo: String(empresa.name || 'Empresa')
            })),
        [empresas]
    );

    useEffect(() => {
        setPagina(1);
    }, [termoBusca]);

    useEffect(() => {
        setPagina(1);
        setTermoBusca('');
        setIdsSelecionados(new Set());
    }, [empresaAtivaId]);

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

        const opcoesRelatorio = { filtro: 'todos' };

        if (empresaAtivaId) {
            opcoesRelatorio.companyId = empresaAtivaId;
        }

        try {
            await baixarRelatorioFuncionarios(token, opcoesRelatorio);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível baixar o relatório.');
        } finally {
            setBaixandoRelatorio(false);
        }
    }

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Funcionários</h1>
                <p className="admin-pagina__subtitulo">
                    Consulte funcionários, edite cadastros e emita relatórios por empresa.
                </p>
            </header>

            {abasEmpresas.length > 0 ? (
                <AbasModulo
                    abaAtiva={empresaAtivaId}
                    abas={abasEmpresas}
                    rotuloAria="Empresas"
                    onTrocarAba={setEmpresaAtivaId}
                />
            ) : null}

            <div className="modulo-pesquisa">
                <label className="campo-pesquisa campo-pesquisa--modulo">
                    <span className="visually-hidden">Pesquisar funcionários</span>
                    <input
                        type="search"
                        placeholder="Buscar por nome, cargo, setor ou status…"
                        value={termoBusca}
                        onChange={(evento) => setTermoBusca(evento.target.value)}
                    />
                </label>
            </div>

            <section className="gerenciamento-painel listagem-painel">
                <CabecalhoListagemPainel
                    icone={<IconeEmpresaFuncionarios />}
                    titulo={empresaAtiva?.name || 'Funcionários'}
                    descricao={
                        empresaAtiva
                            ? `Funcionários cadastrados na empresa ${empresaAtiva.name}.`
                            : 'Cadastre empresas para organizar os funcionários por unidade.'
                    }
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
                    <EstatisticasFuncionarios
                        total={estatisticas.total}
                        admitidos={estatisticas.admitidos}
                        demitidosInativos={estatisticas.demitidosInativos}
                    />

                    {carregando ? (
                        <p className="estado-carregando">Carregando funcionários…</p>
                    ) : erro ? (
                        <p className="estado-erro" role="alert">
                            {erro}
                        </p>
                    ) : empresas.length === 0 ? (
                        <p className="estado-vazio">Nenhuma empresa cadastrada.</p>
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
        </section>
    );
}
