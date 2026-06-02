import { montarParesExportacaoFichaFuncionario } from './montarParesExportacaoFichaFuncionario.js';

describe('montarParesExportacaoFichaFuncionario', () => {
    it('deve montar pares campo-valor com rotulos da ficha', () => {
        const pares = montarParesExportacaoFichaFuncionario({
            name: 'João Silva',
            cpf: '529.982.247-25',
            email: 'joao@empresa.com',
            telefone: '(11) 91234-5678',
            birthDate: new Date('1990-01-15T12:00:00.000Z'),
            status: 'ATIVO',
            admissionDate: new Date('2020-03-01T12:00:00.000Z'),
            resignationDate: null,
            valeTransporte: true,
            valeAlimentacao: false,
            planoSaude: true,
            role: { name: 'Analista' },
            company: { name: 'Empresa X' },
            setor: { nome: 'TI' }
        });

        expect(pares.length).toBeGreaterThan(0);
        expect(pares.some(par => par.campo === 'Nome' && par.valor === 'João Silva')).toBe(true);
        expect(pares.some(par => par.valor === 'Sim')).toBe(true);
        expect(pares.some(par => par.valor === 'Não')).toBe(true);
        expect(pares.some(par => par.valor === 'Analista')).toBe(true);
    });
});
