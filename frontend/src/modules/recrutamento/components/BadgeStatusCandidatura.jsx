import { obterRotuloStatusCandidatura } from '../utils/formatarRecrutamento.js';
import { STATUS_CANDIDATURA } from '../constants/recrutamentoConstantes.js';

/**
 * @param {{ status: string }} props
 */
export function BadgeStatusCandidatura({ status }) {
    const classe =
        status === STATUS_CANDIDATURA.PENDENTE
            ? 'badge-candidatura badge-candidatura--pendente'
            : status === STATUS_CANDIDATURA.PROXIMA_FASE
              ? 'badge-candidatura badge-candidatura--proxima-fase'
              : 'badge-candidatura badge-candidatura--descartado';

    return <span className={classe}>{obterRotuloStatusCandidatura(status)}</span>;
}
