import { montarConteudoEmailConviteCadastro } from './montarConteudoEmailConviteCadastro.js';

describe('montarConteudoEmailConviteCadastro', () => {
    it('deve montar texto e html com link e nome', () => {
        const resultado = montarConteudoEmailConviteCadastro({
            nomeCandidato: 'Maria',
            urlCadastro: 'http://localhost:5173/publico/cadastro-contratacao/tok'
        });

        expect(resultado.texto).toContain('Maria');
        expect(resultado.texto).toContain('http://localhost:5173/publico/cadastro-contratacao/tok');
        expect(resultado.html).toContain('Parabéns pela continuidade');
        expect(resultado.html).toContain('http://localhost:5173/publico/cadastro-contratacao/tok');
    });

    it('deve usar nome padrao quando candidato nao informado', () => {
        const resultado = montarConteudoEmailConviteCadastro({
            nomeCandidato: '   ',
            urlCadastro: 'http://localhost:5173/publico/cadastro-contratacao/tok'
        });

        expect(resultado.texto).toContain('candidato(a)');
        expect(resultado.html).toContain('candidato(a)');
    });

    it('deve escapar HTML no nome', () => {
        const resultado = montarConteudoEmailConviteCadastro({
            nomeCandidato: '<script>',
            urlCadastro: 'http://x/y'
        });

        expect(resultado.html).toContain('&lt;script&gt;');
        expect(resultado.html).not.toContain('<script>');
    });
});
