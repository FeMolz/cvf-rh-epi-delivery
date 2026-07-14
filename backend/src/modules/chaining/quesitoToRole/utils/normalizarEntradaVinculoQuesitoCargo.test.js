import { normalizarEntradaVinculoQuesitoCargo } from './normalizarEntradaVinculoQuesitoCargo.js';
import { MENSAGEM_ROLE_ID_QUESITO_IDS_OBRIGATORIOS } from '../../../quesitos/constants/quesitoConstantes.js';

describe('normalizarEntradaVinculoQuesitoCargo', () => {
    it('deve normalizar quesitoId unico', () => {
        const resultado = normalizarEntradaVinculoQuesitoCargo({
            roleId: ' cargo-1 ',
            quesitoId: ' quesito-1 '
        });

        expect(resultado).toEqual({
            roleId: 'cargo-1',
            quesitoIds: ['quesito-1'],
            envioUnico: true
        });
    });

    it('deve normalizar array quesitoIds sem duplicatas', () => {
        const resultado = normalizarEntradaVinculoQuesitoCargo({
            roleId: 'cargo-1',
            quesitoIds: ['q1', 'q2', 'q1', '']
        });

        expect(resultado).toEqual({
            roleId: 'cargo-1',
            quesitoIds: ['q1', 'q2'],
            envioUnico: false
        });
    });

    it('deve rejeitar quando nao ha quesitos', () => {
        expect(() => normalizarEntradaVinculoQuesitoCargo({ roleId: 'cargo-1' })).toThrow(
            MENSAGEM_ROLE_ID_QUESITO_IDS_OBRIGATORIOS
        );
        expect(() =>
            normalizarEntradaVinculoQuesitoCargo({ roleId: 'cargo-1', quesitoIds: ['', 123] })
        ).toThrow(MENSAGEM_ROLE_ID_QUESITO_IDS_OBRIGATORIOS);
    });

    it('deve rejeitar roleId ausente ou invalido', () => {
        expect(() => normalizarEntradaVinculoQuesitoCargo({ quesitoId: 'q1' })).toThrow(
            MENSAGEM_ROLE_ID_QUESITO_IDS_OBRIGATORIOS
        );
        expect(() =>
            normalizarEntradaVinculoQuesitoCargo({ roleId: '   ', quesitoId: 'q1' })
        ).toThrow(MENSAGEM_ROLE_ID_QUESITO_IDS_OBRIGATORIOS);
        expect(() =>
            normalizarEntradaVinculoQuesitoCargo({ roleId: 123, quesitoId: 'q1' })
        ).toThrow(MENSAGEM_ROLE_ID_QUESITO_IDS_OBRIGATORIOS);
    });

    it('deve combinar quesitoId e quesitoIds sem duplicatas', () => {
        const resultado = normalizarEntradaVinculoQuesitoCargo({
            roleId: 'cargo-1',
            quesitoId: 'q1',
            quesitoIds: ['q2', 'q1']
        });

        expect(resultado).toEqual({
            roleId: 'cargo-1',
            quesitoIds: ['q2', 'q1'],
            envioUnico: false
        });
    });
});
