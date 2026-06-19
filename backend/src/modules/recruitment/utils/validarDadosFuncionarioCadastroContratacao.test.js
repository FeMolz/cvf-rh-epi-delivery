import {
    MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO,
    MENSAGEM_CARGO_NAO_EDITAVEL
} from '../constants/recrutamentoConstantes.js';
import { validarDadosFuncionarioCadastroContratacao } from './validarDadosFuncionarioCadastroContratacao.js';

const vinculos = { roleId: 'r1', companyId: 'c1', setorId: 's1' };

describe('validarDadosFuncionarioCadastroContratacao', () => {
    it('deve validar dados obrigatorios do candidato', () => {
        const resultado = validarDadosFuncionarioCadastroContratacao(
            {
                name: 'Maria Silva',
                cpf: '529.982.247-25',
                email: 'maria@email.com',
                telefone: '(11) 91234-5678',
                birthDate: '1990-05-10'
            },
            vinculos
        );

        expect(resultado.roleId).toBe('r1');
        expect(resultado.cpf).toBe('529.982.247-25');
        expect(resultado).not.toHaveProperty('admissionDate');
    });

    it('deve rejeitar alteracao de cargo', () => {
        expect(() =>
            validarDadosFuncionarioCadastroContratacao(
                {
                    name: 'Maria',
                    cpf: '529.982.247-25',
                    email: 'maria@email.com',
                    telefone: '(11) 91234-5678',
                    birthDate: '1990-05-10',
                    roleId: 'outro'
                },
                vinculos
            )
        ).toThrow(MENSAGEM_CARGO_NAO_EDITAVEL);
    });

    it('deve rejeitar campos obrigatorios ausentes', () => {
        expect(() =>
            validarDadosFuncionarioCadastroContratacao({ name: 'Maria' }, vinculos)
        ).toThrow(MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO);
    });
});
