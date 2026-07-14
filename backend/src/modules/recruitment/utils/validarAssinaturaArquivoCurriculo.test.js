import { MENSAGEM_CURRICULO_CONTEUDO_INVALIDO } from '../../../shared/constants/segurancaConstantes.js';
import { validarAssinaturaArquivoCurriculo } from './validarAssinaturaArquivoCurriculo.js';

describe('validarAssinaturaArquivoCurriculo', () => {
    it('deve aceitar pdf com assinatura válida', () => {
        expect(() =>
            validarAssinaturaArquivoCurriculo(Buffer.from('%PDF-1.4'), 'curriculo.pdf')
        ).not.toThrow();
    });

    it('deve rejeitar pdf com assinatura inválida', () => {
        expect(() =>
            validarAssinaturaArquivoCurriculo(Buffer.from('conteudo'), 'curriculo.pdf')
        ).toThrow(MENSAGEM_CURRICULO_CONTEUDO_INVALIDO);
    });

    it('deve validar assinatura de arquivo .doc', () => {
        const bufferDoc = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0x00]);

        expect(() => validarAssinaturaArquivoCurriculo(bufferDoc, 'curriculo.doc')).not.toThrow();
        expect(() => validarAssinaturaArquivoCurriculo(Buffer.from('x'), 'curriculo.doc')).toThrow(
            MENSAGEM_CURRICULO_CONTEUDO_INVALIDO
        );
    });

    it('deve validar assinatura de arquivo .docx e .odt', () => {
        const bufferZip = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]);

        expect(() => validarAssinaturaArquivoCurriculo(bufferZip, 'curriculo.docx')).not.toThrow();
        expect(() => validarAssinaturaArquivoCurriculo(bufferZip, 'curriculo.odt')).not.toThrow();
        expect(() => validarAssinaturaArquivoCurriculo(Buffer.from('x'), 'curriculo.docx')).toThrow(
            MENSAGEM_CURRICULO_CONTEUDO_INVALIDO
        );
    });

    it('deve validar assinatura de arquivo .rtf', () => {
        expect(() =>
            validarAssinaturaArquivoCurriculo(Buffer.from('{\\rtf1'), 'curriculo.rtf')
        ).not.toThrow();
        expect(() =>
            validarAssinaturaArquivoCurriculo(Buffer.from('texto'), 'curriculo.rtf')
        ).toThrow(MENSAGEM_CURRICULO_CONTEUDO_INVALIDO);
    });

    it('deve rejeitar pdf com buffer menor que assinatura', () => {
        expect(() =>
            validarAssinaturaArquivoCurriculo(Buffer.from('PD'), 'curriculo.pdf')
        ).toThrow(MENSAGEM_CURRICULO_CONTEUDO_INVALIDO);
    });

    it('deve ignorar validação de assinatura para extensão não mapeada', () => {
        expect(() =>
            validarAssinaturaArquivoCurriculo(Buffer.from('texto'), 'curriculo.txt')
        ).not.toThrow();
    });

    it('deve aceitar nome de arquivo ausente para pdf válido', () => {
        expect(() =>
            validarAssinaturaArquivoCurriculo(Buffer.from('%PDF-1.4'), undefined)
        ).not.toThrow();
    });
});
