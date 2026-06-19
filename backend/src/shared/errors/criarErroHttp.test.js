import { criarErroHttp, criarErroNaoEncontrado } from './criarErroHttp.js';

describe('criarErroHttp', () => {
    it('deve criar erro com statusCode padrão 400', () => {
        const erro = criarErroHttp('Mensagem de validação');

        expect(erro).toBeInstanceOf(Error);
        expect(erro.message).toBe('Mensagem de validação');
        expect(erro.statusCode).toBe(400);
    });

    it('deve aceitar statusCode customizado', () => {
        const erro = criarErroHttp('Proibido', 403);

        expect(erro.statusCode).toBe(403);
    });
});

describe('criarErroNaoEncontrado', () => {
    it('deve criar erro 404 com mensagem informada', () => {
        const erro = criarErroNaoEncontrado('Recurso ausente');

        expect(erro.message).toBe('Recurso ausente');
        expect(erro.statusCode).toBe(404);
    });

    it('deve usar mensagem padrão quando omitida', () => {
        const erro = criarErroNaoEncontrado();

        expect(erro.message).toBe('Recurso não encontrado');
        expect(erro.statusCode).toBe(404);
    });
});
