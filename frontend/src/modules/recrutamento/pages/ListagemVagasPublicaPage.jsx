import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { LayoutAplicacao } from '../../usuarios/components/LayoutAplicacao.jsx';
import {
    MODOS_TRABALHO_VAGA,
    ROTULOS_MODO_TRABALHO,
    ROTULOS_TIPO_CONTRATACAO,
    TIPOS_CONTRATACAO_VAGA
} from '../constants/recrutamentoConstantes.js';
import { listarVagasPublicas } from '../services/recrutamentoApi.js';
import {
    filtrarVagasPublicas,
    listarLocaisTrabalhoUnicos,
    obterRotuloModoTrabalho,
    obterRotuloTipoContratacao
} from '../utils/formatarRecrutamento.js';
import './recrutamento.css';

const FILTROS_INICIAIS = {
    termo: '',
    modoTrabalho: '',
    tipoContratacao: '',
    localTrabalho: ''
};

export function ListagemVagasPublicaPage() {
    const [vagas, setVagas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [filtros, setFiltros] = useState(FILTROS_INICIAIS);

    const carregarVagas = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const lista = await listarVagasPublicas();
            setVagas(lista);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar as vagas.');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarVagas();
    }, [carregarVagas]);

    const locaisDisponiveis = useMemo(() => listarLocaisTrabalhoUnicos(vagas), [vagas]);

    const vagasFiltradas = useMemo(
        () => filtrarVagasPublicas(vagas, filtros),
        [vagas, filtros]
    );

    function atualizarFiltro(campo, valor) {
        setFiltros((atual) => ({ ...atual, [campo]: valor }));
    }

    function limparFiltros() {
        setFiltros(FILTROS_INICIAIS);
    }

    const temFiltroAtivo = Boolean(
        filtros.termo || filtros.modoTrabalho || filtros.tipoContratacao || filtros.localTrabalho
    );

    return (
        <LayoutAplicacao
            largura="ampla"
            variante="aberta"
            titulo="Vagas abertas"
            subtitulo="Confira as oportunidades disponíveis e candidate-se."
        >
            <section className="recrutamento-portal__filtros" aria-label="Filtros de vagas">
                <div className="recrutamento-portal__filtros-grade">
                    <label className="recrutamento-portal__filtro">
                        <span>Buscar</span>
                        <input
                            type="search"
                            placeholder="Título da vaga"
                            value={filtros.termo}
                            onChange={(evento) => atualizarFiltro('termo', evento.target.value)}
                        />
                    </label>

                    <label className="recrutamento-portal__filtro">
                        <span>Tipo de vaga</span>
                        <select
                            value={filtros.modoTrabalho}
                            onChange={(evento) => atualizarFiltro('modoTrabalho', evento.target.value)}
                        >
                            <option value="">Todos</option>
                            {Object.values(MODOS_TRABALHO_VAGA).map((modo) => (
                                <option key={modo} value={modo}>
                                    {ROTULOS_MODO_TRABALHO[modo]}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="recrutamento-portal__filtro">
                        <span>Modelo de contratação</span>
                        <select
                            value={filtros.tipoContratacao}
                            onChange={(evento) =>
                                atualizarFiltro('tipoContratacao', evento.target.value)
                            }
                        >
                            <option value="">Todos</option>
                            {Object.values(TIPOS_CONTRATACAO_VAGA).map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    {ROTULOS_TIPO_CONTRATACAO[tipo]}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="recrutamento-portal__filtro">
                        <span>Local de trabalho</span>
                        <select
                            value={filtros.localTrabalho}
                            onChange={(evento) => atualizarFiltro('localTrabalho', evento.target.value)}
                        >
                            <option value="">Todos</option>
                            {locaisDisponiveis.map((local) => (
                                <option key={local} value={local}>
                                    {local}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {temFiltroAtivo ? (
                    <button
                        className="botao botao--secundario recrutamento-portal__limpar-filtros"
                        type="button"
                        onClick={limparFiltros}
                    >
                        Limpar filtros
                    </button>
                ) : null}
            </section>

            <AreaMensagensFeedback erro={erro} />

            {carregando ? (
                <p className="mensagem">Carregando vagas…</p>
            ) : (
                <div className="recrutamento-cartoes recrutamento-cartoes--portal">
                    {vagasFiltradas.map((vaga) => (
                        <article key={vaga.id} className="recrutamento-cartao recrutamento-cartao--portal">
                            <h2>{vaga.tituloVaga}</h2>
                            <p className="recrutamento-cartao__meta">
                                {vaga.localTrabalho} · {obterRotuloModoTrabalho(vaga.modoTrabalho)} ·{' '}
                                {obterRotuloTipoContratacao(vaga.tipoContratacao)}
                            </p>
                            <Link className="botao botao--primario" to={`/publico/vagas/${vaga.id}`}>
                                Ver vaga
                            </Link>
                        </article>
                    ))}

                    {!vagasFiltradas.length ? (
                        <p className="mensagem">Nenhuma vaga encontrada com os filtros selecionados.</p>
                    ) : null}
                </div>
            )}
        </LayoutAplicacao>
    );
}
