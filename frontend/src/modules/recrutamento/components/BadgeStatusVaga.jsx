import { obterClasseStatusVaga, obterRotuloStatusVaga } from '../utils/formatarRecrutamento.js';

/**
 * @param {{ status: string }} props
 */
export function BadgeStatusVaga({ status }) {
    return <span className={obterClasseStatusVaga(status)}>{obterRotuloStatusVaga(status)}</span>;
}
