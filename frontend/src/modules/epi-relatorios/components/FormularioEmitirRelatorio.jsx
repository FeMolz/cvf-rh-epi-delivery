import { PAPEIS_CADASTRO_USUARIO } from '../../../shared/constants/papeis.js';

/**
 * @param {{
 *   funcionarios: Array<{ id: string, name: string, roleName?: string }>,
 *   funcionarioId: string,
 *   periodoInicio: string,
 *   periodoFim: string,
 *   processando?: boolean,
 *   podeEmitir?: boolean,
 *   onAlterarFuncionario: (id: string) => void,
 *   onAlterarPeriodoInicio: (valor: string) => void,
 *   onAlterarPeriodoFim: (valor: string) => void,
 *   onEmitir: () => void
 * }} props
 */
export function FormularioEmitirRelatorio({
    funcionarios,
    funcionarioId,
    periodoInicio,
    periodoFim,
    processando = false,
    podeEmitir = true,
    onAlterarFuncionario,
    onAlterarPeriodoInicio,
    onAlterarPeriodoFim,
    onEmitir
}) {
    if (!podeEmitir) {
        return null;
    }

    return (
        <section className="epi-relatorios__formulario">
            <div className="epi-relatorios__formulario-linha">
                <div className="campo epi-relatorios__campo-funcionario">
                    <label htmlFor="relatorio-funcionario">Funcionário</label>
                    <select
                        id="relatorio-funcionario"
                        value={funcionarioId}
                        disabled={processando}
                        onChange={(evento) => onAlterarFuncionario(evento.target.value)}
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
                    <label htmlFor="relatorio-periodo-inicio">Período início</label>
                    <input
                        id="relatorio-periodo-inicio"
                        type="date"
                        value={periodoInicio}
                        disabled={processando}
                        onChange={(evento) => onAlterarPeriodoInicio(evento.target.value)}
                    />
                </div>

                <div className="campo epi-relatorios__campo-data">
                    <label htmlFor="relatorio-periodo-fim">Período fim</label>
                    <input
                        id="relatorio-periodo-fim"
                        type="date"
                        value={periodoFim}
                        disabled={processando}
                        onChange={(evento) => onAlterarPeriodoFim(evento.target.value)}
                    />
                </div>

                <button
                    className="botao botao--primario epi-relatorios__botao-emitir"
                    type="button"
                    disabled={processando || !funcionarioId || !periodoInicio || !periodoFim}
                    onClick={onEmitir}
                >
                    {processando ? 'Gerando…' : 'Gerar relatório'}
                </button>
            </div>
        </section>
    );
}

/**
 * @param {string} papel
 */
export function usuarioPodeGerenciarRelatoriosEpi(papel) {
    return PAPEIS_CADASTRO_USUARIO.includes(papel);
}
