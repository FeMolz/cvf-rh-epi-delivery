import { MENSAGEM_CPF_DUPLICADO } from '../constants/funcionarioConstantes.js';
import { MENSAGEM_FILTRO_FUNCIONARIO_INVALIDO } from '../constants/funcionarioStatusConstantes.js';
import { lancarErroFuncionario } from './lancarErroFuncionario.js';

describe('lancarErroFuncionario', () => {
    it('deve lançar erro 400 para validação conhecida', () => {
        expect(() => lancarErroFuncionario(MENSAGEM_CPF_DUPLICADO)).toThrow(MENSAGEM_CPF_DUPLICADO);

        try {
            lancarErroFuncionario(MENSAGEM_CPF_DUPLICADO);
        } catch (erro) {
            expect(erro.statusCode).toBe(400);
        }
    });

    it('deve lançar erro 404 para funcionário não encontrado', () => {
        try {
            lancarErroFuncionario('Funcionário não encontrado');
        } catch (erro) {
            expect(erro.statusCode).toBe(404);
        }
    });

    it('deve lançar erro 400 para filtro inválido', () => {
        try {
            lancarErroFuncionario(MENSAGEM_FILTRO_FUNCIONARIO_INVALIDO);
        } catch (erro) {
            expect(erro.statusCode).toBe(400);
        }
    });

    it('deve lançar erro 400 para mensagem desconhecida', () => {
        try {
            lancarErroFuncionario('Erro genérico de funcionário');
        } catch (erro) {
            expect(erro.statusCode).toBe(400);
            expect(erro.message).toBe('Erro genérico de funcionário');
        }
    });
});
