import {
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
});
