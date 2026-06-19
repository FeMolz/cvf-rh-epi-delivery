import { escaparHtml } from './escaparHtml.js';

describe('escaparHtml', () => {
    it('deve escapar caracteres especiais HTML', () => {
        expect(escaparHtml('<script>alert("x")</script>')).toBe(
            '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
        );
    });

    it('deve tratar valores nulos como string vazia', () => {
        expect(escaparHtml(null)).toBe('');
    });
});
