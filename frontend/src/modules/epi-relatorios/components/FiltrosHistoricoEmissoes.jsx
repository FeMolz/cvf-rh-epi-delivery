/**
 * @param {{
 *   funcionarios: Array<{ id: string, name: string, roleName?: string }>,
 *   employeeId: string,
 *   emissaoInicio: string,
 *   emissaoFim: string,
 *   processando?: boolean,
 *   onAlterarEmployeeId: (valor: string) => void,
 *   onAlterarEmissaoInicio: (valor: string) => void,
 *   onAlterarEmissaoFim: (valor: string) => void,
 *   onBuscar: () => void,
 *   onLimpar: () => void
 * }} props
 */
export function FiltrosHistoricoEmissoes({
    funcionarios,
    employeeId,
    emissaoInicio,
    emissaoFim,
    processando = false,
    onAlterarEmployeeId,
    onAlterarEmissaoInicio,
    onAlterarEmissaoFim,
    onBuscar,
    onLimpar
}) {
    return (
        <section className="epi-relatorios__filtros">
            <div className="epi-relatorios__filtros-linha">
                <div className="campo epi-relatorios__campo-filtro">
                    <label htmlFor="historico-funcionario">Funcionário</label>
                    <select
                        id="historico-funcionario"
                        value={employeeId}
                        disabled={processando}
                        onChange={(evento) => onAlterarEmployeeId(evento.target.value)}
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

                <div className="campo epi-relatorios__campo-data">
                    <label htmlFor="historico-emissao-inicio">Emissão de</label>
                    <input
                        id="historico-emissao-inicio"
                        type="date"
                        value={emissaoInicio}
                        disabled={processando || !employeeId}
                        onChange={(evento) => onAlterarEmissaoInicio(evento.target.value)}
                    />
                </div>

                <div className="campo epi-relatorios__campo-data">
                    <label htmlFor="historico-emissao-fim">Emissão até</label>
                    <input
                        id="historico-emissao-fim"
                        type="date"
                        value={emissaoFim}
                        disabled={processando || !employeeId}
                        onChange={(evento) => onAlterarEmissaoFim(evento.target.value)}
                    />
                </div>

                <button
                    className="botao botao--primario epi-relatorios__botao-buscar"
                    type="button"
                    disabled={processando || !employeeId}
                    onClick={onBuscar}
                >
                    {processando ? 'Buscando…' : 'Buscar emissões'}
                </button>

                <button
                    className="botao botao--secundario epi-relatorios__botao-limpar"
                    type="button"
                    disabled={processando}
                    onClick={onLimpar}
                >
                    Limpar
                </button>
            </div>
        </section>
    );
}
