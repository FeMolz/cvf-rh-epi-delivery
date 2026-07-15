import { jest } from '@jest/globals';
import * as constantesRecrutamento from '../constants/recrutamentoConstantes.js';
import { MENSAGEM_CURRICULO_CONTEUDO_INVALIDO } from '../../../shared/constants/segurancaConstantes.js';

const {
    MENSAGEM_CURRICULO_OBRIGATORIO,
    MENSAGEM_CURRICULO_TAMANHO_EXCEDIDO,
    MENSAGEM_CURRICULO_TIPO_NAO_PERMITIDO,
    TAMANHO_MAXIMO_CURRICULO_BYTES
} = constantesRecrutamento;

jest.unstable_mockModule('../constants/recrutamentoConstantes.js', () => ({
    ...constantesRecrutamento,
    EXTENSOES_CURRICULO_PERMITIDAS: ['', ...constantesRecrutamento.EXTENSOES_CURRICULO_PERMITIDAS]
}));

const { validarArquivoCurriculo } = await import('./validarArquivoCurriculo.js');

describe('validarArquivoCurriculo', () => {
    it('deve aceitar pdf válido com mime e assinatura corretos', () => {
        const resultado = validarArquivoCurriculo({
            buffer: Buffer.from('%PDF-1.4 conteudo'),
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

    it('deve rejeitar quando mime e extensão não forem coerentes', () => {
        expect(() =>
            validarArquivoCurriculo({
                buffer: Buffer.from('%PDF-1.4'),
                mimetype: 'image/png',
                originalname: 'foto.png',
                size: 100
            })
        ).toThrow(MENSAGEM_CURRICULO_TIPO_NAO_PERMITIDO);
    });

    it('deve rejeitar pdf com assinatura inválida', () => {
        expect(() =>
            validarArquivoCurriculo({
                buffer: Buffer.from('conteudo-invalido'),
                mimetype: 'application/pdf',
                originalname: 'cv.pdf',
                size: 100
            })
        ).toThrow(MENSAGEM_CURRICULO_CONTEUDO_INVALIDO);
    });

    it('deve rejeitar tamanho excedido', () => {
        expect(() =>
            validarArquivoCurriculo({
                buffer: Buffer.from('%PDF-1.4'),
                mimetype: 'application/pdf',
                originalname: 'cv.pdf',
                size: TAMANHO_MAXIMO_CURRICULO_BYTES + 1
            })
        ).toThrow(MENSAGEM_CURRICULO_TAMANHO_EXCEDIDO);
    });

    it('deve normalizar metadados inválidos antes da validação de tipo', () => {
        expect(() =>
            validarArquivoCurriculo({
                buffer: Buffer.from('%PDF-1.4 conteudo'),
                mimetype: 123,
                originalname: 456,
                size: 'grande'
            })
        ).toThrow(MENSAGEM_CURRICULO_TIPO_NAO_PERMITIDO);
    });

    it('deve rejeitar arquivo sem buffer', () => {
        expect(() =>
            validarArquivoCurriculo({
                mimetype: 'application/pdf',
                originalname: 'cv.pdf',
                size: 100
            })
        ).toThrow(MENSAGEM_CURRICULO_OBRIGATORIO);
    });

    it('deve usar nome padrao curriculo quando originalname estiver vazio apos trim', () => {
        const resultado = validarArquivoCurriculo({
            buffer: Buffer.from('%PDF-1.4 conteudo'),
            mimetype: 'application/pdf',
            originalname: '   ',
            size: 100
        });

        expect(resultado.nomeArquivo).toBe('curriculo');
    });
});
