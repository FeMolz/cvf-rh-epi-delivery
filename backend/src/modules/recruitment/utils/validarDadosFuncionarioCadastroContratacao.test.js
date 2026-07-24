import {
    MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO,
    MENSAGEM_CARGO_NAO_EDITAVEL,
    MENSAGEM_EMPRESA_NAO_EDITAVEL,
    MENSAGEM_SETOR_NAO_EDITAVEL
} from '../constants/recrutamentoConstantes.js';
import { MENSAGEM_DATA_NASCIMENTO_INVALIDA } from '../../employees/constants/funcionarioConstantes.js';
import { validarDadosFuncionarioCadastroContratacao } from './validarDadosFuncionarioCadastroContratacao.js';

const vinculos = { roleId: 'r1', companyId: 'c1', setorId: 's1' };

const dadosCompletos = {
    name: 'Maria Silva',
    cpf: '529.982.247-25',
    email: 'maria@email.com',
    telefone: '(11) 91234-5678',
    birthDate: '1990-05-10',
    nacionalidade: 'Brasileira',
    estadoCivil: 'SOLTEIRO',
    racaCor: 'PARDA',
    filiacao: 'João e Ana',
    grauInstrucao: 'SUPERIOR_COMPLETO',
    numeroCtps: '12345',
    serieCtps: '001',
    numeroDependentes: 0,
    pis: '12345678901',
    chavePix: 'maria@email.com',
    cep: '01310-100',
    logradouro: 'Av. Paulista',
    numeroEndereco: '1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP'
};

describe('validarDadosFuncionarioCadastroContratacao', () => {
    it('deve validar dados obrigatorios do candidato', () => {
        const resultado = validarDadosFuncionarioCadastroContratacao(dadosCompletos, vinculos);

        expect(resultado.roleId).toBe('r1');
        expect(resultado.cpf).toBe('529.982.247-25');
        expect(resultado.cidade).toBe('São Paulo');
        expect(resultado).not.toHaveProperty('admissionDate');
    });

    it('deve rejeitar alteracao de cargo', () => {
        expect(() =>
            validarDadosFuncionarioCadastroContratacao({ ...dadosCompletos, roleId: 'outro' }, vinculos)
        ).toThrow(MENSAGEM_CARGO_NAO_EDITAVEL);
    });

    it('deve rejeitar campos obrigatorios ausentes', () => {
        expect(() =>
            validarDadosFuncionarioCadastroContratacao({ name: 'Maria' }, vinculos)
        ).toThrow(MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO);
    });

    it('deve rejeitar alteracao de empresa', () => {
        expect(() =>
            validarDadosFuncionarioCadastroContratacao(
                { ...dadosCompletos, companyId: 'outra' },
                vinculos
            )
        ).toThrow(MENSAGEM_EMPRESA_NAO_EDITAVEL);
    });

    it('deve rejeitar alteracao de setor', () => {
        expect(() =>
            validarDadosFuncionarioCadastroContratacao({ ...dadosCompletos, setorId: 'outro' }, vinculos)
        ).toThrow(MENSAGEM_SETOR_NAO_EDITAVEL);
    });

    it('deve rejeitar data de nascimento invalida', () => {
        expect(() =>
            validarDadosFuncionarioCadastroContratacao(
                { ...dadosCompletos, birthDate: 'data-invalida' },
                vinculos
            )
        ).toThrow(MENSAGEM_DATA_NASCIMENTO_INVALIDA);
    });

    it('deve aceitar birthDate como instancia de Date', () => {
        const resultado = validarDadosFuncionarioCadastroContratacao(
            { ...dadosCompletos, birthDate: new Date('1990-05-10') },
            vinculos
        );

        expect(resultado.birthDate).toEqual(new Date('1990-05-10'));
    });

    it('deve tratar campos textuais ausentes como vazio', () => {
        expect(() =>
            validarDadosFuncionarioCadastroContratacao(
                {
                    name: 123,
                    cpf: null,
                    email: undefined,
                    telefone: false,
                    birthDate: '1990-05-10'
                },
                vinculos
            )
        ).toThrow(MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO);
    });

    it('deve aceitar birthDate numérico convertível', () => {
        const resultado = validarDadosFuncionarioCadastroContratacao(
            { ...dadosCompletos, birthDate: Date.parse('1990-05-10') },
            vinculos
        );

        expect(resultado.birthDate).toBeInstanceOf(Date);
    });
});
