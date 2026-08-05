import { useMemo, useState } from 'react';

import { PesquisaEpiPorNome } from '../../epis/components/PesquisaEpiPorNome.jsx';
import { filtrarEpis, filtrarEpisPorSituacao } from '../../epis/utils/listagemEpis.js';

/**
 * @param {{
 *   token: string,
 *   episCache: Array<Record<string, unknown>>,
 *   episSelecionados: string[],
 *   desabilitado?: boolean,
 *   onAlternarEpi: (caNumber: string) => void
 * }} props
 */
export function SelecaoEpisSemVinculoCargo({
    token,
    episCache,
    episSelecionados,
    desabilitado = false,
    onAlternarEpi
}) {
    const [termoCache, setTermoCache] = useState('');

    const episCacheAtivos = useMemo(
        () => filtrarEpis(filtrarEpisPorSituacao(episCache, false), termoCache),
        [episCache, termoCache]
    );

    return (
        <div className="entregas-epi__selecao-sem-cargo">
            <p className="admin-pagina__subtitulo entregas-epi__selecao-sem-cargo-aviso">
                O cargo deste funcionário não possui EPIs vinculados. Pesquise na base pública ou
                selecione equipamentos já em cache no sistema.
            </p>

            <PesquisaEpiPorNome
                token={token}
                desabilitado={desabilitado}
                episSelecionados={episSelecionados}
                onAlternarEpi={onAlternarEpi}
                episCache={episCache}
            />

            <section className="entregas-epi__cache-epis">
                <header className="epis-pesquisa-nome__cabecalho">
                    <h3>EPIs em cache</h3>
                    <p className="admin-pagina__subtitulo">
                        Equipamentos já consultados e salvos localmente no sistema.
                    </p>
                </header>

                <div className="epis-pesquisa-nome__formulario entregas-epi__cache-formulario">
                    <label className="campo-pesquisa campo-pesquisa--modulo epis-pesquisa-nome__campo">
                        <span className="visually-hidden">Filtrar EPIs em cache</span>
                        <input
                            type="search"
                            placeholder="Filtrar por nome ou CA…"
                            value={termoCache}
                            disabled={desabilitado}
                            onChange={(evento) => setTermoCache(evento.target.value)}
                        />
                    </label>
                </div>

                {!episCacheAtivos.length ? (
                    <p className="estado-vazio entregas-epi__selecao-vazia">
                        {termoCache.trim()
                            ? 'Nenhum EPI em cache corresponde ao filtro.'
                            : 'Nenhum EPI ativo em cache no momento.'}
                    </p>
                ) : (
                    <ul className="entregas-epi__lista-epis">
                        {episCacheAtivos.map((epi) => {
                            const caNumber = String(epi.caNumber);
                            const selecionado = episSelecionados.includes(caNumber);

                            return (
                                <li key={String(epi.id || caNumber)}>
                                    <label className="entregas-epi__opcao-epi">
                                        <input
                                            type="checkbox"
                                            checked={selecionado}
                                            disabled={desabilitado}
                                            onChange={() => onAlternarEpi(caNumber)}
                                        />
                                        <span>
                                            {epi.name} <strong>CA {caNumber}</strong>
                                        </span>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}
