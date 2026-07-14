import { sanitizarNomeArquivoDownload } from './sanitizarNomeArquivoDownload.js';

describe('sanitizarNomeArquivoDownload', () => {
    it('deve preservar nome válido com acentuação', () => {
        expect(sanitizarNomeArquivoDownload('Currículo João.pdf')).toBe('Currículo João.pdf');
    });

    it('deve substituir caracteres inválidos por underscore', () => {
        expect(sanitizarNomeArquivoDownload('arquivo@malicioso#.pdf')).toBe('arquivo_malicioso_.pdf');
    });

    it('deve usar basename e fallback para curriculo', () => {
        expect(sanitizarNomeArquivoDownload('../etc/passwd')).toBe('passwd');
        expect(sanitizarNomeArquivoDownload('.')).toBe('curriculo');
        expect(sanitizarNomeArquivoDownload('..')).toBe('curriculo');
        expect(sanitizarNomeArquivoDownload(null)).toBe('curriculo');
    });

    it('deve limitar tamanho do nome do arquivo', () => {
        const nomeLongo = `${'a'.repeat(250)}.pdf`;

        expect(sanitizarNomeArquivoDownload(nomeLongo)).toHaveLength(200);
    });
});
