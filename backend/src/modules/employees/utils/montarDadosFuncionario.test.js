import {
    converterDataFuncionario,
    montarDadosFuncionario,
    normalizarDatasAtualizacaoFuncionario
} from './montarDadosFuncionario.js';

describe('montarDadosFuncionario', () => {
    it('deve incluir campos opcionais quando informados', () => {
        const entrada = {
            name: 'Maria',
            cpf: '123',
            email: 'maria@empresa.com',
            telefone: '11999999999',
            birthDate: new Date('1990-01-01'),
            companyId: 'comp-1',
            roleId: 'role-1',
            setorId: '30303030-3030-3030-3030-303030303030',
            nacionalidade: 'Brasileira',
            estadoCivil: 'CASADO',
            numeroDependentes: 2,
            valeTransporte: true
        };

        const resultado = montarDadosFuncionario(entrada);

        expect(resultado.nacionalidade).toBe('Brasileira');
        expect(resultado.estadoCivil).toBe('CASADO');
        expect(resultado.numeroDependentes).toBe(2);
        expect(resultado.valeTransporte).toBe(true);
    });

    it('nao deve incluir campos opcionais vazios', () => {
        const entrada = {
            name: 'Maria',
            cpf: '123',
            email: 'maria@empresa.com',
            telefone: '11999999999',
            birthDate: new Date('1990-01-01'),
            companyId: 'comp-1',
            roleId: 'role-1',
            setorId: '30303030-3030-3030-3030-303030303030',
            nacionalidade: '',
            pis: null
        };

        const resultado = montarDadosFuncionario(entrada);

        expect(resultado.nacionalidade).toBeUndefined();
        expect(resultado.pis).toBeUndefined();
    });
});

describe('converterDataFuncionario', () => {
    it('deve converter string YYYY-MM-DD em Date', () => {
        const data = converterDataFuncionario('1995-08-12');

        expect(data).toBeInstanceOf(Date);
        expect(data?.toISOString().startsWith('1995-08-12')).toBe(true);
    });

    it('deve normalizar apenas campos de data informados', () => {
        const resultado = normalizarDatasAtualizacaoFuncionario({
            name: 'Maria',
            birthDate: '1995-08-12',
            admissionDate: '2026-05-10'
        });

        expect(resultado.name).toBe('Maria');
        expect(resultado.birthDate).toBeInstanceOf(Date);
        expect(resultado.admissionDate).toBeInstanceOf(Date);
    });
});
