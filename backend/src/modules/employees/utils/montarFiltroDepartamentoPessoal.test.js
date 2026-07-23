import {
    montarWhereConsultaFuncionarios,
    montarOrdenacaoAdmissaoConsulta
} from './montarFiltroConsultaDepartamentoPessoal.js';
import {
    montarWhereFerias,
    ordenarFeriasVencidosPrimeiro,
    ordenarFeriasProximosVencimentos
} from './montarFiltroFeriasDepartamentoPessoal.js';

describe('montarFiltroConsultaDepartamentoPessoal', () => {
    it('deve montar filtro padrão de ativos', () => {
        const where = montarWhereConsultaFuncionarios();

        expect(where).toEqual({
            deletedAt: null,
            status: { in: ['ATIVO'] }
        });
    });

    it('deve montar filtro de demitidos', () => {
        const where = montarWhereConsultaFuncionarios({ situacao: 'demitidos' });

        expect(where.deletedAt).toBeUndefined();
        expect(where.status).toEqual({
            in: ['INATIVO', 'DESLIGADO', 'RESCINDIDO', 'APOSENTADO']
        });
    });

    it('deve excluir funcionários excluídos logicamente no filtro de ativos', () => {
        const where = montarWhereConsultaFuncionarios({ situacao: 'ativos' });

        expect(where.deletedAt).toBeNull();
    });

    it('deve incluir funcionários excluídos logicamente no filtro todos', () => {
        const where = montarWhereConsultaFuncionarios({ situacao: 'todos' });

        expect(where.deletedAt).toBeUndefined();
    });

    it('deve montar ordenação de admissão antigas', () => {
        expect(montarOrdenacaoAdmissaoConsulta('antigas')).toEqual({ admissionDate: 'asc' });
    });
});

describe('montarFiltroFeriasDepartamentoPessoal', () => {
    it('deve montar where de férias com proximidade', () => {
        const where = montarWhereFerias({ proximidade: 30 }, new Date('2026-07-20T12:00:00.000Z'));

        expect(where.status).toBe('FERIAS');
        expect(where.OR).toHaveLength(2);
    });

    it('deve ordenar vencidos primeiro', () => {
        const referencia = new Date('2026-07-20T12:00:00.000Z');
        const ordenados = ordenarFeriasVencidosPrimeiro(
            [
                { id: '1', leaveReturnDate: new Date('2026-08-01') },
                { id: '2', leaveReturnDate: new Date('2026-06-01') }
            ],
            referencia
        );

        expect(ordenados[0].id).toBe('2');
    });

    it('deve ordenar próximos vencimentos', () => {
        const ordenados = ordenarFeriasProximosVencimentos([
            { id: '1', leaveReturnDate: new Date('2026-08-01') },
            { id: '2', leaveReturnDate: new Date('2026-07-01') }
        ]);

        expect(ordenados[0].id).toBe('2');
    });
});
