import { useState } from 'react';

import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { buscarEpisPorNome } from '../services/episApi.js';

/**
 * @param {{
 *   token: string,
 *   desabilitado?: boolean,
 *   onSelecionarCa: (caNumber: string) => void
 * }} props
 */
export function PesquisaEpiPorNome({ token, desabilitado = false, onSelecionarCa }) {
    const [termo, setTermo] = useState('');
    const [resultados, setResultados] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [erro, setErro] = useState('');
    const [caSelecionado, setCaSelecionado] = useState('');

    async function pesquisar(evento) {
        evento.preventDefault();
        setErro('');
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
            setErro(erroCapturado.message || 'Não foi possível pesquisar EPIs por nome.');
        } finally {
            setBuscando(false);
        }
    }

    function selecionarResultado(item) {
        const ca = String(item.caNumber || '');
        setCaSelecionado(ca);
        onSelecionarCa(ca);
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
                        onChange={(evento) => setTermo(evento.target.value)}
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

            <AreaMensagensFeedback erro={erro} onLimparErro={() => setErro('')} />

            {resultados.length > 0 ? (
                <ul className="epis-pesquisa-nome__resultados">
                    {resultados.map((item) => {
                        const ca = String(item.caNumber);
                        const ativo = caSelecionado === ca;

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
