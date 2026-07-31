import {
    MENSAGEM_APRESENTACAO_EMPRESA_OBRIGATORIA,
    MENSAGEM_BENEFICIOS_OBRIGATORIOS,
    MENSAGEM_COMPANY_ID_OBRIGATORIO,
    MENSAGEM_JORNADA_TRABALHO_OBRIGATORIA,
    MENSAGEM_LOCAL_TRABALHO_OBRIGATORIO,
    MENSAGEM_MODO_TRABALHO_INVALIDO,
    MENSAGEM_REQUISITOS_OBRIGATORIOS,
    MENSAGEM_RESPONSABILIDADES_OBRIGATORIAS,
    MENSAGEM_ROLE_ID_OBRIGATORIO,
    MENSAGEM_SETOR_ID_OBRIGATORIO,
    MENSAGEM_SOBRE_VAGA_OBRIGATORIA,
    MENSAGEM_TIPO_CONTRATACAO_INVALIDO,
    MENSAGEM_TITULO_VAGA_OBRIGATORIO
} from '../constants/recrutamentoConstantes.js';
import { normalizarCamposAnuncioVaga } from './normalizarCamposAnuncioVaga.js';

const entradaValida = {
    tituloVaga: ' Analista ',
    apresentacaoEmpresa: ' Empresa ',
    sobreVaga: ' Sobre ',
    responsabilidades: ' Resp ',
    requisitos: ' Req ',
    beneficios: ' Ben ',
    localTrabalho: ' SP ',
    modoTrabalho: ' hibrido ',
    tipoContratacao: 'clt',
    jornadaTrabalho: ' 44h ',
    faixaSalarial: ' R$ 5000 ',
    roleId: 'role-1',
    companyId: 'comp-1',
    setorId: 'setor-1'
};

describe('normalizarCamposAnuncioVaga', () => {
    it('deve normalizar e validar campos obrigatorios', () => {
        const resultado = normalizarCamposAnuncioVaga(entradaValida);

        expect(resultado.tituloVaga).toBe('Analista');
        expect(resultado.tipoContratacao).toBe('CLT');
        expect(resultado.faixaSalarial).toBe('R$ 5000');
    });

    it('deve rejeitar titulo vazio quando obrigatorio', () => {
        expect(() =>
            normalizarCamposAnuncioVaga({ ...entradaValida, tituloVaga: '' })
        ).toThrow(MENSAGEM_TITULO_VAGA_OBRIGATORIO);
    });

    it('deve rejeitar tipo de contratacao invalido', () => {
        expect(() =>
            normalizarCamposAnuncioVaga({ ...entradaValida, tipoContratacao: 'FREELANCE' })
        ).toThrow(MENSAGEM_TIPO_CONTRATACAO_INVALIDO);
    });

    it('deve permitir campos opcionais quando nao obrigatorio', () => {
        const resultado = normalizarCamposAnuncioVaga(
            { tipoContratacao: 'PJ' },
            { obrigatorio: false }
        );

        expect(resultado.tipoContratacao).toBe('PJ');
        expect(resultado.tituloVaga).toBe('');
    });

    it.each([
        ['apresentacaoEmpresa', MENSAGEM_APRESENTACAO_EMPRESA_OBRIGATORIA],
        ['sobreVaga', MENSAGEM_SOBRE_VAGA_OBRIGATORIA],
        ['responsabilidades', MENSAGEM_RESPONSABILIDADES_OBRIGATORIAS],
        ['requisitos', MENSAGEM_REQUISITOS_OBRIGATORIOS],
        ['beneficios', MENSAGEM_BENEFICIOS_OBRIGATORIOS],
        ['localTrabalho', MENSAGEM_LOCAL_TRABALHO_OBRIGATORIO],
        ['jornadaTrabalho', MENSAGEM_JORNADA_TRABALHO_OBRIGATORIA],
        ['roleId', MENSAGEM_ROLE_ID_OBRIGATORIO],
        ['companyId', MENSAGEM_COMPANY_ID_OBRIGATORIO],
        ['setorId', MENSAGEM_SETOR_ID_OBRIGATORIO]
    ])('deve rejeitar campo obrigatório ausente: %s', (campo, mensagem) => {
        expect(() =>
            normalizarCamposAnuncioVaga({ ...entradaValida, [campo]: '' })
        ).toThrow(mensagem);
    });

    it('deve rejeitar tipo de contratacao vazio quando obrigatorio', () => {
        expect(() =>
            normalizarCamposAnuncioVaga({ ...entradaValida, tipoContratacao: '' })
        ).toThrow(MENSAGEM_TIPO_CONTRATACAO_INVALIDO);
    });

    it('deve rejeitar modo de trabalho vazio quando obrigatorio', () => {
        expect(() =>
            normalizarCamposAnuncioVaga({ ...entradaValida, modoTrabalho: '' })
        ).toThrow(MENSAGEM_MODO_TRABALHO_INVALIDO);
    });

    it('deve rejeitar modo de trabalho invalido', () => {
        expect(() =>
            normalizarCamposAnuncioVaga({ ...entradaValida, modoTrabalho: 'INVALIDO' })
        ).toThrow(MENSAGEM_MODO_TRABALHO_INVALIDO);
    });

    it('deve normalizar campos não textuais como vazio', () => {
        const resultado = normalizarCamposAnuncioVaga(
            { tipoContratacao: 123, tituloVaga: 99 },
            { obrigatorio: false }
        );

        expect(resultado.tipoContratacao).toBe('');
        expect(resultado.tituloVaga).toBe('');
    });
});
