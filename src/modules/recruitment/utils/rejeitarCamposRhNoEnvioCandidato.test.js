import {
    MENSAGEM_ADMISSION_DATE_NAO_EDITAVEL_CANDIDATO,
    MENSAGEM_BENEFICIOS_NAO_EDITAVEIS_CANDIDATO
} from '../constants/recrutamentoConstantes.js';
import { rejeitarCamposRhNoEnvioCandidato } from './rejeitarCamposRhNoEnvioCandidato.js';

describe('rejeitarCamposRhNoEnvioCandidato', () => {
    it('deve permitir envio sem campos exclusivos do RH', () => {
        expect(() =>
            rejeitarCamposRhNoEnvioCandidato({ name: 'Maria', birthDate: '1990-01-01' })
        ).not.toThrow();
    });

    it('deve rejeitar admissionDate enviada pelo candidato', () => {
        expect(() =>
            rejeitarCamposRhNoEnvioCandidato({ admissionDate: '2026-06-01' })
        ).toThrow(MENSAGEM_ADMISSION_DATE_NAO_EDITAVEL_CANDIDATO);
    });

    it('deve rejeitar beneficios enviados pelo candidato', () => {
        expect(() => rejeitarCamposRhNoEnvioCandidato({ valeTransporte: true })).toThrow(
            MENSAGEM_BENEFICIOS_NAO_EDITAVEIS_CANDIDATO
        );
    });
});
