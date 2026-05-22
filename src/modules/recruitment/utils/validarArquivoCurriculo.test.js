import {
    MENSAGEM_CURRICULO_OBRIGATORIO,
    MENSAGEM_CURRICULO_TAMANHO_EXCEDIDO,
    MENSAGEM_CURRICULO_TIPO_NAO_PERMITIDO,
    TAMANHO_MAXIMO_CURRICULO_BYTES
} from '../constants/recrutamentoConstantes.js';
import { validarArquivoCurriculo } from './validarArquivoCurriculo.js';

describe('validarArquivoCurriculo', () => {
    it('deve aceitar pdf valido', () => {
        const resultado = validarArquivoCurriculo({
            buffer: Buffer.from('x'),
            mimetype: 'application/pdf',
            originalname: 'cv.pdf',
            size: 500
        });

        expect(resultado.nomeArquivo).toBe('cv.pdf');
        expect(resultado.tamanhoBytes).toBe(500);
    });

    it('deve rejeitar arquivo ausente', () => {
        expect(() => validarArquivoCurriculo(undefined)).toThrow(MENSAGEM_CURRICULO_OBRIGATORIO);
    });

    it('deve rejeitar tipo nao permitido', () => {
        expect(() =>
            validarArquivoCurriculo({
                buffer: Buffer.from('x'),
                mimetype: 'image/png',
                originalname: 'foto.png',
                size: 100
            })
        ).toThrow(MENSAGEM_CURRICULO_TIPO_NAO_PERMITIDO);
    });

    it('deve rejeitar tamanho excedido', () => {
        expect(() =>
            validarArquivoCurriculo({
                buffer: Buffer.from('x'),
                mimetype: 'application/pdf',
                originalname: 'cv.pdf',
                size: TAMANHO_MAXIMO_CURRICULO_BYTES + 1
            })
        ).toThrow(MENSAGEM_CURRICULO_TAMANHO_EXCEDIDO);
    });
});
