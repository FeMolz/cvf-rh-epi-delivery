import { montarDadosPersistenciaCadastroContratacao } from './montarDadosPersistenciaCadastroContratacao.js';

describe('montarDadosPersistenciaCadastroContratacao', () => {
    it('deve mesclar campos opcionais pessoais aos dados obrigatorios', () => {
        const obrigatorios = {
            name: 'Maria',
            cpf: '529.982.247-25',
            email: 'maria@email.com',
            telefone: '(11) 91234-5678',
            birthDate: new Date('1990-01-01'),
            roleId: 'r1',
            companyId: 'c1',
            setorId: 's1'
        };

        const resultado = montarDadosPersistenciaCadastroContratacao(
            {
                nacionalidade: ' Brasileira ',
                estadoCivil: 'SOLTEIRO',
                numeroDependentes: '2',
                cep: '01310-100'
            },
            obrigatorios
        );

        expect(resultado.name).toBe('Maria');
        expect(resultado.nacionalidade).toBe('Brasileira');
        expect(resultado.estadoCivil).toBe('SOLTEIRO');
        expect(resultado.numeroDependentes).toBe(2);
        expect(resultado.cep).toBe('01310-100');
        expect(resultado).not.toHaveProperty('valeTransporte');
    });
});
