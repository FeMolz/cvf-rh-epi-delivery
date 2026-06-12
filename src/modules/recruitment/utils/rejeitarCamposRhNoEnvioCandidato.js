import {
    MENSAGEM_ADMISSION_DATE_NAO_EDITAVEL_CANDIDATO,
    MENSAGEM_BENEFICIOS_NAO_EDITAVEIS_CANDIDATO
} from '../constants/recrutamentoConstantes.js';
import { lancarErroRecrutamento } from './lancarErroRecrutamento.js';

const CAMPOS_EXCLUSIVOS_RH = [
    'admissionDate',
    'valeTransporte',
    'valeAlimentacao',
    'planoSaude'
];

/**
 * @param {object} entrada
 */
export function rejeitarCamposRhNoEnvioCandidato(entrada) {
    for (const campo of CAMPOS_EXCLUSIVOS_RH) {
        if (entrada[campo] !== undefined && entrada[campo] !== null && entrada[campo] !== '') {
            if (campo === 'admissionDate') {
                lancarErroRecrutamento(MENSAGEM_ADMISSION_DATE_NAO_EDITAVEL_CANDIDATO);
            }
            lancarErroRecrutamento(MENSAGEM_BENEFICIOS_NAO_EDITAVEIS_CANDIDATO);
        }
    }
}
