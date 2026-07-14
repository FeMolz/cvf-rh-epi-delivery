import { MENSAGEM_ANUNCIO_NAO_ENCONTRADO, MENSAGEM_EMAIL_OBRIGATORIO } from '../constants/recrutamentoConstantes.js';
import { lancarErroRecrutamento } from './lancarErroRecrutamento.js';

describe('lancarErroRecrutamento', () => {
    it('deve lançar erro 404 para mensagens mapeadas', () => {
        expect(() => lancarErroRecrutamento(MENSAGEM_ANUNCIO_NAO_ENCONTRADO)).toThrow(
            MENSAGEM_ANUNCIO_NAO_ENCONTRADO
        );

        try {
            lancarErroRecrutamento(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
        } catch (erro) {
            expect(erro.statusCode).toBe(404);
        }
    });

    it('deve lançar erro 400 para mensagens mapeadas', () => {
        try {
            lancarErroRecrutamento(MENSAGEM_EMAIL_OBRIGATORIO);
        } catch (erro) {
            expect(erro.statusCode).toBe(400);
            expect(erro.message).toBe(MENSAGEM_EMAIL_OBRIGATORIO);
        }
    });

    it('deve lançar erro 400 para mensagem não mapeada', () => {
        try {
            lancarErroRecrutamento('Erro genérico');
        } catch (erro) {
            expect(erro.statusCode).toBe(400);
            expect(erro.message).toBe('Erro genérico');
        }
    });
});
