import { ROTULOS_STATUS_CANDIDATURA, STATUS_CANDIDATURA } from '../constants/recrutamentoConstantes.js';

const OPCOES_FILTRO_STATUS = [
    STATUS_CANDIDATURA.PENDENTE,
    STATUS_CANDIDATURA.PROXIMA_FASE
];

/**
 * @param {{
 *   valor: string,
 *   onChange: (status: string) => void
 * }} props
 */
export function SeletorFiltroStatusCandidatura({ valor, onChange }) {
    return (
        <label className="recrutamento-seletor-vaga">
            <span className="recrutamento-seletor-vaga__rotulo">Filtrar por status</span>
            <select
                className="recrutamento-seletor-vaga__campo"
                value={valor}
                onChange={(evento) => onChange(evento.target.value)}
            >
                <option value="">Todos os status</option>
                {OPCOES_FILTRO_STATUS.map((status) => (
                    <option key={status} value={status}>
                        {ROTULOS_STATUS_CANDIDATURA[status]}
                    </option>
                ))}
            </select>
        </label>
    );
}
