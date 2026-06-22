import { useMemo } from 'react';

import { obterDataIsoHoje } from '../utils/dataEntregaEpi.js';

/**
 * @param {{
 *   funcionarios: Array<{ id: string, name: string, roleName?: string }>,
 *   epis: Array<Record<string, unknown>>,
 *   funcionarioSelecionadoId: string,
 *   episSelecionados: string[],
 *   dataEntrega: string,
 *   carregando?: boolean,
 *   onSelecionarFuncionario: (id: string) => void,
 *   onAlterarDataEntrega: (data: string) => void,
 *   onAlternarEpi: (caNumber: string) => void,
 *   onEntregar: () => void
 * }} props
 */
export function FormularioEntregaEpi({
    funcionarios,
    epis,
    funcionarioSelecionadoId,
    episSelecionados,
    dataEntrega,
    carregando = false,
    onSelecionarFuncionario,
    onAlterarDataEntrega,
    onAlternarEpi,
    onEntregar
}) {
    const funcionarioSelecionado = useMemo(
        () => funcionarios.find((funcionario) => funcionario.id === funcionarioSelecionadoId),
        [funcionarios, funcionarioSelecionadoId]
    );

    return (
        <section className="entregas-epi__formulario">
            <div className="entregas-epi__formulario-linha">
                <div className="campo entregas-epi__campo-funcionario">
                    <label htmlFor="entrega-funcionario">Funcionário</label>
                    <select
                        id="entrega-funcionario"
                        value={funcionarioSelecionadoId}
                        disabled={carregando}
                        onChange={(evento) => onSelecionarFuncionario(evento.target.value)}
                    >
                        <option value="">Selecione um funcionário…</option>
                        {funcionarios.map((funcionario) => (
                            <option key={funcionario.id} value={funcionario.id}>
                                {funcionario.name}
                                {funcionario.roleName ? ` — ${funcionario.roleName}` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="campo entregas-epi__campo-data">
                    <label htmlFor="entrega-data">Data da entrega</label>
                    <input
                        id="entrega-data"
                        type="date"
                        value={dataEntrega}
                        max={obterDataIsoHoje()}
                        disabled={carregando}
                        onChange={(evento) => onAlterarDataEntrega(evento.target.value)}
                    />
                </div>

                <button
                    className="botao botao--primario entregas-epi__botao-entregar"
                    type="button"
                    disabled={
                        carregando ||
                        !funcionarioSelecionadoId ||
                        !dataEntrega ||
                        episSelecionados.length === 0
                    }
                    onClick={onEntregar}
                >
                    {carregando ? 'Entregando…' : 'Entregar'}
                </button>
            </div>

            {funcionarioSelecionadoId ? (
                <fieldset className="entregas-epi__selecao-epis" disabled={carregando}>
                    <legend>
                        EPIs para entregar
                        {funcionarioSelecionado?.name ? ` — ${funcionarioSelecionado.name}` : ''}
                    </legend>

                    {!epis.length ? (
                        <p className="estado-vazio entregas-epi__selecao-vazia">
                            Nenhum EPI vinculado ao cargo deste funcionário.
                        </p>
                    ) : (
                        <ul className="entregas-epi__lista-epis">
                            {epis.map((epi) => {
                                const caNumber = String(epi.caNumber);
                                const selecionado = episSelecionados.includes(caNumber);

                                return (
                                    <li key={String(epi.epiId)}>
                                        <label className="entregas-epi__opcao-epi">
                                            <input
                                                type="checkbox"
                                                checked={selecionado}
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
                </fieldset>
            ) : (
                <p className="admin-pagina__subtitulo entregas-epi__ajuda">
                    Selecione um funcionário para escolher os EPIs e registrar a entrega.
                </p>
            )}
        </section>
    );
}
