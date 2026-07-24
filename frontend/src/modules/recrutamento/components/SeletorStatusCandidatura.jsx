import { STATUS_CANDIDATURA } from '../constants/recrutamentoConstantes.js';

/**
 * @param {{
 *   statusAtual: string,
 *   desabilitado?: boolean,
 *   onAlterarStatus: (status: string) => void
 * }} props
 */
export function SeletorStatusCandidatura({ statusAtual, desabilitado = false, onAlterarStatus }) {
    if (statusAtual === STATUS_CANDIDATURA.DESCARTADO) {
        return null;
    }

    return (
        <select
            className="seletor-status-candidatura"
            value=""
            disabled={desabilitado}
            onChange={(evento) => {
                if (evento.target.value) {
                    onAlterarStatus(evento.target.value);
                    evento.target.value = '';
                }
            }}
        >
            <option value="">Alterar status</option>
            {statusAtual !== STATUS_CANDIDATURA.PROXIMA_FASE ? (
                <option value={STATUS_CANDIDATURA.PROXIMA_FASE}>Próxima fase</option>
            ) : null}
            <option value={STATUS_CANDIDATURA.DESCARTADO}>Descartar</option>
        </select>
    );
}
