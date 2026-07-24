import { montarDadosPersistenciaCadastroContratacao } from './montarDadosPersistenciaCadastroContratacao.js';

describe('montarDadosPersistenciaCadastroContratacao', () => {
    it('deve preservar dados validados e complemento opcional', () => {
        const obrigatorios = {
            name: 'Maria',
            cpf: '529.982.247-25',
            email: 'maria@email.com',
            telefone: '(11) 91234-5678',
            birthDate: new Date('1990-01-01'),
            roleId: 'r1',
            companyId: 'c1',
            setorId: 's1',
            nacionalidade: 'Brasileira',
            cidade: 'São Paulo'
        };

        const resultado = montarDadosPersistenciaCadastroContratacao(
            { complemento: ' Apto 12 ' },
            obrigatorios
        );

        expect(resultado.name).toBe('Maria');
        expect(resultado.nacionalidade).toBe('Brasileira');
        expect(resultado.complemento).toBe('Apto 12');
        expect(resultado).not.toHaveProperty('valeTransporte');
    });

    it('deve zerar complemento quando nao informado', () => {
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

        const resultado = montarDadosPersistenciaCadastroContratacao({}, obrigatorios);

        expect(resultado.complemento).toBeNull();
    });
});
