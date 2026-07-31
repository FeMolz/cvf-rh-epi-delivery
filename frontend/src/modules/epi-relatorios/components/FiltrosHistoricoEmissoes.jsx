import { CampoDataBr } from '../../../shared/components/CampoDataBr.jsx';

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

                <div className="epi-relatorios__campo-data">
                    <CampoDataBr
                        id="historico-emissao-inicio"
                        rotulo="Emissão de"
                        value={emissaoInicio}
                        onChange={onAlterarEmissaoInicio}
                    />
                </div>

                <div className="epi-relatorios__campo-data">
                    <CampoDataBr
                        id="historico-emissao-fim"
                        rotulo="Emissão até"
                        value={emissaoFim}
                        onChange={onAlterarEmissaoFim}
                    />
                </div>

                <button
                    className="botao botao--primario epi-relatorios__botao-buscar"
                    type="button"
                    disabled={
                        processando || (!employeeId && !(emissaoInicio && emissaoFim))
                    }
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
