/**
 * @param {{
 *   funcionarios: Array<{ id: string, name: string, roleName?: string }>,
 *   employeeId: string,
 *   situacaoAssinatura: string,
 *   onAlterarEmployeeId: (valor: string) => void,
 *   onAlterarSituacaoAssinatura: (valor: string) => void,
 *   onLimpar: () => void
 * }} props
 */
export function FiltrosRelatoriosEntrega({
    funcionarios,
    employeeId,
    situacaoAssinatura,
    onAlterarEmployeeId,
    onAlterarSituacaoAssinatura,
    onLimpar
}) {
    return (
        <section className="epi-relatorios__filtros">
            <div className="epi-relatorios__filtros-linha">
                <div className="campo epi-relatorios__campo-filtro">
                    <label htmlFor="filtro-funcionario">Funcionário</label>
                    <select
                        id="filtro-funcionario"
                        value={employeeId}
                        onChange={(evento) => onAlterarEmployeeId(evento.target.value)}
                    >
                        <option value="">Todos</option>
                        {funcionarios.map((funcionario) => (
                            <option key={funcionario.id} value={funcionario.id}>
                                {funcionario.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="campo epi-relatorios__campo-filtro">
                    <label htmlFor="filtro-situacao">Situação</label>
                    <select
                        id="filtro-situacao"
                        value={situacaoAssinatura}
                        onChange={(evento) => onAlterarSituacaoAssinatura(evento.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="false">Pendentes de assinatura</option>
                        <option value="true">Assinados</option>
                    </select>
                </div>

                <button
                    className="botao botao--secundario epi-relatorios__botao-limpar"
                    type="button"
                    onClick={onLimpar}
                >
                    Limpar filtros
                </button>
            </div>
        </section>
    );
}
