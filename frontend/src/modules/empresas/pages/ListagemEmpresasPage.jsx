import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AbasModulo } from '../../../shared/components/AbasModulo.jsx';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { paginarLista } from '../../../shared/utils/listagemUsuarios.js';
import { ITENS_POR_PAGINA_PADRAO, Paginacao } from '../../usuarios/components/Paginacao.jsx';
import { IconeAbaEmpresas } from '../components/IconeAbaEmpresas.jsx';
import { TabelaEmpresas } from '../components/TabelaEmpresas.jsx';
import { listarEmpresas } from '../services/empresasApi.js';
import { filtrarEmpresas, filtrarEmpresasPorSituacao } from '../utils/listagemEmpresas.js';

const ABAS_EMPRESAS = [
    { id: 'ativas', rotulo: 'Ativas' },
    { id: 'inativas', rotulo: 'Inativas' }
];

export function ListagemEmpresasPage() {
    const { token } = useAuth();
    const [abaAtiva, setAbaAtiva] = useState('ativas');
    const [empresas, setEmpresas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [termoBusca, setTermoBusca] = useState('');
    const [pagina, setPagina] = useState(1);

    const apenasInativas = abaAtiva === 'inativas';

    const carregarEmpresas = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const lista = await listarEmpresas(token);
            setEmpresas(lista);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar as empresas.');
        } finally {
            setCarregando(false);
        }
    }, [token]);

    useEffect(() => {
        carregarEmpresas();
    }, [carregarEmpresas]);

    const empresasFiltradas = useMemo(() => {
        const porSituacao = filtrarEmpresasPorSituacao(empresas, apenasInativas);
        return filtrarEmpresas(porSituacao, termoBusca);
    }, [empresas, apenasInativas, termoBusca]);

    const paginacao = useMemo(
        () => paginarLista(empresasFiltradas, pagina, ITENS_POR_PAGINA_PADRAO),
        [empresasFiltradas, pagina]
    );

    useEffect(() => {
        setPagina(1);
    }, [termoBusca]);

    useEffect(() => {
        setPagina(1);
        setTermoBusca('');
    }, [abaAtiva]);

    const abasComIcone = ABAS_EMPRESAS.map((aba) => ({
        ...aba,
        icone: <IconeAbaEmpresas id={aba.id} />
    }));

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Empresas</h1>
                <p className="admin-pagina__subtitulo">
                    Consulte empresas ativas e inativas vinculadas aos funcionários do sistema.
                </p>
            </header>

            <AbasModulo
                abaAtiva={abaAtiva}
                abas={abasComIcone}
                rotuloAria="Situação das empresas"
                onTrocarAba={setAbaAtiva}
            />

            <div className="modulo-pesquisa">
                <label className="campo-pesquisa campo-pesquisa--modulo">
                    <span className="visually-hidden">Pesquisar empresas</span>
                    <input
                        type="search"
                        placeholder="Buscar por nome ou CNPJ…"
                        value={termoBusca}
                        onChange={(evento) => setTermoBusca(evento.target.value)}
                    />
                </label>
            </div>

            <section className="gerenciamento-painel listagem-painel">
                <CabecalhoListagemPainel
                    icone={<IconeAbaEmpresas id={abaAtiva} />}
                    titulo={apenasInativas ? 'Empresas inativas' : 'Empresas ativas'}
                    descricao={
                        apenasInativas
                            ? 'Empresas desativadas que não podem receber novos vínculos.'
                            : 'Empresas disponíveis para funcionários e processos de RH.'
                    }
                />

                <div className="listagem-painel__conteudo">
                    {carregando ? (
                        <p className="estado-carregando">Carregando empresas…</p>
                    ) : erro ? (
                        <p className="estado-erro" role="alert">
                            {erro}
                        </p>
                    ) : (
                        <>
                            <TabelaEmpresas empresas={paginacao.itens} />
                            <Paginacao
                                paginaAtual={paginacao.paginaAtual}
                                totalPaginas={paginacao.totalPaginas}
                                totalItens={paginacao.totalItens}
                                rotuloItens="empresa(s)"
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
