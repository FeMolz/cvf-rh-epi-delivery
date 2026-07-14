import { inicioDoDia } from './afastamentoTemporarioFuncionario.js';
import { resolverDataDesligamentoFuncionario } from './resolverDataDesligamentoFuncionario.js';

describe('resolverDataDesligamentoFuncionario', () => {
    it('deve exigir data ao desligar funcionário', () => {
        expect(() =>
            resolverDataDesligamentoFuncionario({
                statusAnterior: 'ATIVO',
                statusNovo: 'DESLIGADO',
                resignationDate: undefined,
                resignationDateAnterior: null
            })
        ).toThrow('Informe a data de desligamento para demissão, rescisão ou aposentadoria.');
    });

    it('deve aceitar data informada ao desligar', () => {
        const resultado = resolverDataDesligamentoFuncionario({
            statusAnterior: 'ATIVO',
            statusNovo: 'DESLIGADO',
            resignationDate: '2024-06-01'
        });

        expect(resultado.resignationDate).toBeInstanceOf(Date);
    });

    it('deve reutilizar data anterior quando funcionário já está desligado', () => {
        const dataAnterior = new Date('2024-01-15');

        const resultado = resolverDataDesligamentoFuncionario({
            statusAnterior: 'DESLIGADO',
            statusNovo: 'DESLIGADO',
            resignationDateAnterior: dataAnterior
        });

        expect(resultado.resignationDate).toEqual(inicioDoDia(dataAnterior));
    });

    it('deve limpar data ao readmitir funcionário', () => {
        const resultado = resolverDataDesligamentoFuncionario({
            statusAnterior: 'DESLIGADO',
            statusNovo: 'ATIVO',
            resignationDateAnterior: new Date('2024-06-01')
        });

        expect(resultado.resignationDate).toBeNull();
    });

    it('deve rejeitar data ausente ou inválida', () => {
        expect(() =>
            resolverDataDesligamentoFuncionario({
                statusAnterior: 'ATIVO',
                statusNovo: 'RESCINDIDO',
                resignationDate: 'data-invalida'
            })
        ).toThrow('Informe a data de desligamento para demissão, rescisão ou aposentadoria.');
    });
});
