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

        expect(resultado.nacionalidade).toBe('BRASILEIRA');
        expect(resultado.estadoCivil).toBe('CASADO');
        expect(resultado.numeroDependentes).toBe(2);
        expect(resultado.valeTransporte).toBe(true);
    });

    it('deve preservar chavePix sem converter para maiusculas', () => {
        const resultado = montarDadosFuncionario({
            name: 'Maria',
            cpf: '123',
            email: 'maria@empresa.com',
            telefone: '11999999999',
            birthDate: new Date('1990-01-01'),
            companyId: 'comp-1',
            roleId: 'role-1',
            setorId: '30303030-3030-3030-3030-303030303030',
            chavePix: 'email.pix@empresa.com'
        });

        expect(resultado.chavePix).toBe('email.pix@empresa.com');
    });

    it('deve aplicar valores padrão de status e datas', () => {
        const antes = Date.now();
        const resultado = montarDadosFuncionario({
            name: 'João',
            cpf: '123',
            email: 'joao@empresa.com',
            telefone: '11999999999',
            birthDate: new Date('1990-01-01'),
            companyId: 'comp-1',
            roleId: 'role-1',
            setorId: '30303030-3030-3030-3030-303030303030',
            resignationDate: '2024-06-01',
            leaveReturnDate: '2026-12-31',
            valeAlimentacao: false,
            planoSaude: true
        });
        const depois = Date.now();

        expect(resultado.status).toBe('ATIVO');
        expect(resultado.admissionDate).toBeInstanceOf(Date);
        expect(resultado.admissionDate.getTime()).toBeGreaterThanOrEqual(antes);
        expect(resultado.admissionDate.getTime()).toBeLessThanOrEqual(depois);
        expect(resultado.resignationDate).toEqual(new Date(2024, 5, 1));
        expect(resultado.leaveReturnDate).toEqual(new Date(2026, 11, 31));
        expect(resultado.valeAlimentacao).toBe(false);
        expect(resultado.planoSaude).toBe(true);
    });

    it('deve preservar status informado e admissionDate customizada', () => {
        const admissionDate = new Date('2019-01-10');
        const resultado = montarDadosFuncionario({
            name: 'João',
            cpf: '123',
            email: 'joao@empresa.com',
            telefone: '11999999999',
            birthDate: new Date('1990-01-01'),
            companyId: 'comp-1',
            roleId: 'role-1',
            setorId: '30303030-3030-3030-3030-303030303030',
            status: 'FERIAS',
            admissionDate,
            numeroDependentes: 0,
            valeTransporte: false
        });

        expect(resultado.status).toBe('FERIAS');
        expect(resultado.admissionDate).toEqual(admissionDate);
        expect(resultado.numeroDependentes).toBe(0);
        expect(resultado.valeTransporte).toBe(false);
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

    it('deve retornar null para valores vazios ou inválidos', () => {
        expect(converterDataFuncionario(null)).toBeNull();
        expect(converterDataFuncionario('')).toBeNull();
        expect(converterDataFuncionario('  ')).toBeNull();
        expect(converterDataFuncionario('data-invalida')).toBeNull();
    });

    it('deve aceitar instância Date', () => {
        const dataOriginal = new Date('1995-08-12');
        expect(converterDataFuncionario(dataOriginal)).toEqual(dataOriginal);
    });

    it('deve normalizar apenas campos de data informados', () => {
        const resultado = normalizarDatasAtualizacaoFuncionario({
            name: 'Maria',
            birthDate: '1995-08-12',
            admissionDate: '2026-05-10',
            resignationDate: '2024-01-15',
            leaveReturnDate: '2026-12-31'
        });

        expect(resultado.name).toBe('Maria');
        expect(resultado.birthDate).toBeInstanceOf(Date);
        expect(resultado.admissionDate).toBeInstanceOf(Date);
        expect(resultado.resignationDate).toBeInstanceOf(Date);
        expect(resultado.leaveReturnDate).toBeInstanceOf(Date);
    });

    it('deve converter string vazia de data em null na atualização', () => {
        const resultado = normalizarDatasAtualizacaoFuncionario({
            resignationDate: '',
            leaveReturnDate: ''
        });

        expect(resultado.resignationDate).toBeNull();
        expect(resultado.leaveReturnDate).toBeNull();
    });

    it('deve converter valor numérico de data', () => {
        const data = converterDataFuncionario(1_704_067_200_000);
        expect(data).toBeInstanceOf(Date);
    });

    it('deve retornar null para Date inválida', () => {
        expect(converterDataFuncionario(new Date('data-invalida'))).toBeNull();
    });

    it('deve retornar null para timestamp numérico inválido', () => {
        expect(converterDataFuncionario(Number.NaN)).toBeNull();
    });
});
