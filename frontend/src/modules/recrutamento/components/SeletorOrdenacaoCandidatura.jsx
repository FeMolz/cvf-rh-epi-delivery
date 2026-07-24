import { ORDENACAO_CANDIDATURAS } from '../constants/recrutamentoConstantes.js';

/**
 * @param {{
 *   valor: string,
 *   onChange: (ordenacao: string) => void
 * }} props
 */
export function SeletorOrdenacaoCandidatura({ valor, onChange }) {
    return (
        <label className="recrutamento-seletor-vaga">
            <span className="recrutamento-seletor-vaga__rotulo">Ordenar por</span>
            <select
                className="recrutamento-seletor-vaga__campo"
                value={valor}
                onChange={(evento) => onChange(evento.target.value)}
            >
                <option value={ORDENACAO_CANDIDATURAS.RECENTES}>Mais recentes</option>
                <option value={ORDENACAO_CANDIDATURAS.ANTIGOS}>Mais antigos</option>
            </select>
        </label>
    );
}
