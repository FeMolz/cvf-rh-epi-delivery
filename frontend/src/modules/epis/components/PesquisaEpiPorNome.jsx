import { useState } from 'react';

import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { filtrarEpis, filtrarEpisPorSituacao } from '../utils/listagemEpis.js';
import { buscarEpisPorNome } from '../services/episApi.js';

/**
 * @param {{
 *   token: string,
 *   desabilitado?: boolean,
 *   onSelecionarCa?: (caNumber: string) => void,
 *   episSelecionados?: string[],
 *   onAlternarEpi?: (caNumber: string) => void,
 *   episCache?: Array<Record<string, unknown>>
 * }} props
 */
export function PesquisaEpiPorNome({
    token,
    desabilitado = false,
    onSelecionarCa,
    episSelecionados = [],
    onAlternarEpi,
    episCache = []
}) {
    const modoMultiplo = typeof onAlternarEpi === 'function';
    const [termo, setTermo] = useState('');
    const [resultados, setResultados] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [erro, setErro] = useState('');
    const [aviso, setAviso] = useState('');
    const [caSelecionado, setCaSelecionado] = useState('');

    function filtrarCacheLocal(termoNormalizado) {
        return filtrarEpis(filtrarEpisPorSituacao(episCache, false), termoNormalizado).map((epi) => ({
            caNumber: String(epi.caNumber),
            name: epi.name
        }));
    }

    function limparErro() {
        setErro('');
    }

    function limparAviso() {
        setAviso('');
    }

    function atualizarTermo(evento) {
        setTermo(evento.target.value);
    }

    async function pesquisar(evento) {
        evento.preventDefault();
        setErro('');
        setAviso('');
        setResultados([]);
        setCaSelecionado('');

        const termoNormalizado = termo.trim();

        if (termoNormalizado.length < 2) {
            setErro('Informe ao menos 2 caracteres para pesquisar.');
            return;
        }

        setBuscando(true);

        try {
            const lista = await buscarEpisPorNome(termoNormalizado, token);
            setResultados(lista);

            if (!lista.length) {
                setErro('Nenhum EPI encontrado na base pública com esse nome.');
            }
        } catch (erroCapturado) {
            const fallbackCache = filtrarCacheLocal(termoNormalizado);

            if (fallbackCache.length) {
                setResultados(fallbackCache);
                setAviso(
                    'Base pública indisponível — exibindo resultados do cache local.'
                );
            } else {
                setErro(
                    erroCapturado.message ||
                        'Não foi possível pesquisar EPIs por nome e não há itens em cache.'
                );
            }
        } finally {
            setBuscando(false);
        }
    }

    function selecionarResultado(item) {
        const ca = String(item.caNumber || '');

        if (modoMultiplo) {
            onAlternarEpi(ca);
            return;
        }

        setCaSelecionado(ca);
        onSelecionarCa?.(ca);
    }

    return (
        <section className="epis-pesquisa-nome">
            <header className="epis-pesquisa-nome__cabecalho">
                <h3>Buscar EPI por nome</h3>
                <p className="admin-pagina__subtitulo">
                    Pesquise na base pública pelo nome conhecido do equipamento e selecione o CA correto.
                </p>
            </header>

            <form className="epis-pesquisa-nome__formulario" onSubmit={pesquisar}>
                <label className="campo-pesquisa campo-pesquisa--modulo epis-pesquisa-nome__campo">
                    <span className="visually-hidden">Pesquisar EPI por nome</span>
                    <input
                        type="search"
                        placeholder="Ex.: capacete, luva, óculos…"
                        value={termo}
                        disabled={desabilitado || buscando}
                        onChange={atualizarTermo}
                    />
                </label>
                <button
                    className="botao botao--secundario"
                    type="submit"
                    disabled={desabilitado || buscando}
                >
                    {buscando ? 'Pesquisando…' : 'Pesquisar na base pública'}
                </button>
            </form>

            <AreaMensagensFeedback
                erro={erro}
                aviso={aviso}
                avisoTemporario
                onLimparErro={limparErro}
                onLimparAviso={limparAviso}
            />

            {resultados.length > 0 ? (
                <ul className="epis-pesquisa-nome__resultados">
                    {resultados.map((item) => {
                        const ca = String(item.caNumber);
                        const ativo = modoMultiplo
                            ? episSelecionados.includes(ca)
                            : caSelecionado === ca;

                        if (modoMultiplo) {
                            return (
                                <li key={ca}>
                                    <label
                                        className={`epis-pesquisa-nome__item epis-pesquisa-nome__item--checkbox${
                                            ativo ? ' epis-pesquisa-nome__item--ativo' : ''
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={ativo}
                                            disabled={desabilitado}
                                            onChange={() => selecionarResultado(item)}
                                        />
                                        <span className="epis-pesquisa-nome__nome">{item.name}</span>
                                        <span className="epis-pesquisa-nome__ca">CA {ca}</span>
                                    </label>
                                </li>
                            );
                        }

                        return (
                            <li key={ca}>
                                <button
                                    type="button"
                                    className={`epis-pesquisa-nome__item${ativo ? ' epis-pesquisa-nome__item--ativo' : ''}`}
                                    disabled={desabilitado}
                                    onClick={() => selecionarResultado(item)}
                                >
                                    <span className="epis-pesquisa-nome__nome">{item.name}</span>
                                    <span className="epis-pesquisa-nome__ca">CA {ca}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : null}
        </section>
    );
}
