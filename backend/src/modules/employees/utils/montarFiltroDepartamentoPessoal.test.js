import {
    montarFiltroBuscaConsulta,
    montarWhereConsultaFuncionarios,
    montarOrdenacaoAdmissaoConsulta
} from './montarFiltroConsultaDepartamentoPessoal.js';
import {
    montarWhereFerias,
    normalizarOrdenacaoFerias,
    normalizarPaginaFerias,
    normalizarProximidadeFerias,
    normalizarTamanhoPaginaFerias,
    obterFimProximidadeFerias,
    obterInicioDiaReferencia,
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

    it('deve rejeitar situação inválida', () => {
        expect(() => montarWhereConsultaFuncionarios({ situacao: 'inexistente' })).toThrow(
            /Situação inválida/
        );
    });

    it('deve montar filtro de busca com CPF parcial', () => {
        const filtro = montarFiltroBuscaConsulta('123.456');

        expect(filtro?.OR).toHaveLength(3);
        expect(filtro?.OR?.[2]).toEqual({
            cpf: { contains: '123456', mode: 'insensitive' }
        });
    });

    it('deve aplicar filtros de empresa, busca e período de admissão', () => {
        const where = montarWhereConsultaFuncionarios({
            companyId: 'empresa-1',
            busca: 'Maria',
            admissaoDe: '2024-01-01',
            admissaoAte: '2024-12-31'
        });

        expect(where.companyId).toBe('empresa-1');
        expect(where.AND).toHaveLength(1);
        expect(where.admissionDate?.gte).toBeInstanceOf(Date);
        expect(where.admissionDate?.lte).toBeInstanceOf(Date);
    });

    it('deve aplicar somente admissaoDe quando admissaoAte não for informada', () => {
        const where = montarWhereConsultaFuncionarios({ admissaoDe: '2024-01-01' });

        expect(where.admissionDate?.gte).toBeInstanceOf(Date);
        expect(where.admissionDate?.lte).toBeUndefined();
    });

    it('deve aplicar somente admissaoAte quando admissaoDe não for informada', () => {
        const where = montarWhereConsultaFuncionarios({ admissaoAte: '2024-12-31' });

        expect(where.admissionDate?.gte).toBeUndefined();
        expect(where.admissionDate?.lte).toBeInstanceOf(Date);
    });

    it('deve rejeitar data de admissão inválida', () => {
        expect(() =>
            montarWhereConsultaFuncionarios({ admissaoDe: 'data-invalida' })
        ).toThrow(/Data de admissão inválida/);
    });

    it('deve rejeitar ordenação de admissão inválida', () => {
        expect(() => montarOrdenacaoAdmissaoConsulta('invalida')).toThrow(
            /Ordenação de admissão inválida/
        );
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

    it('deve incluir filtro de busca no where de férias', () => {
        const where = montarWhereFerias(
            { proximidade: 30, busca: 'Ana' },
            new Date('2026-07-20T12:00:00.000Z')
        );

        expect(where.AND).toHaveLength(1);
    });

    it('deve normalizar proximidade, ordenação, página e tamanho de página', () => {
        expect(normalizarProximidadeFerias('90')).toBe(90);
        expect(normalizarOrdenacaoFerias('vencidos_primeiro')).toBe('vencidos_primeiro');
        expect(normalizarPaginaFerias('2')).toBe(2);
        expect(normalizarTamanhoPaginaFerias('50')).toBe(50);
    });

    it('deve rejeitar proximidade, ordenação, página e tamanho inválidos', () => {
        expect(() => normalizarProximidadeFerias('15')).toThrow(/Proximidade inválida/);
        expect(() => normalizarOrdenacaoFerias('invalida')).toThrow(/Ordenação inválida/);
        expect(() => normalizarPaginaFerias('0')).toThrow(/Página inválida/);
        expect(() => normalizarTamanhoPaginaFerias('10')).toThrow(/Tamanho de página inválido/);
    });

    it('deve ordenar vencidos primeiro com datas ausentes e não vencidas', () => {
        const referencia = new Date('2026-07-20T12:00:00.000Z');
        const ordenados = ordenarFeriasVencidosPrimeiro(
            [
                { id: '1', leaveReturnDate: null },
                { id: '2', leaveReturnDate: new Date('2026-08-01') },
                { id: '3', leaveReturnDate: new Date('2026-09-01') }
            ],
            referencia
        );

        expect(ordenados.map((funcionario) => funcionario.id)).toEqual(['2', '3', '1']);
    });

    it('deve usar data de referência padrão ao montar where e intervalos', () => {
        const inicio = obterInicioDiaReferencia();
        const fim = obterFimProximidadeFerias(30);
        const where = montarWhereFerias();

        expect(inicio).toBeInstanceOf(Date);
        expect(fim.getTime()).toBeGreaterThan(inicio.getTime());
        expect(where.status).toBe('FERIAS');
    });

    it('deve ordenar próximos vencimentos com datas ausentes', () => {
        const ordenados = ordenarFeriasProximosVencimentos([
            { id: '1', leaveReturnDate: null },
            { id: '2', leaveReturnDate: new Date('2026-08-01') }
        ]);

        expect(ordenados[0].id).toBe('2');
        expect(ordenados[1].id).toBe('1');
    });

    it('deve manter ordem estável quando ambas as datas estão ausentes', () => {
        const ordenados = ordenarFeriasProximosVencimentos([
            { id: '1', leaveReturnDate: null },
            { id: '2', leaveReturnDate: null }
        ]);

        expect(ordenados).toHaveLength(2);
    });

    it('deve colocar vencido à frente quando comparado com não vencido', () => {
        const referencia = new Date(2026, 6, 20);
        const ordenados = ordenarFeriasVencidosPrimeiro(
            [
                { id: 'futuro', leaveReturnDate: new Date(2026, 7, 1) },
                { id: 'vencido', leaveReturnDate: new Date(2026, 5, 1) }
            ],
            referencia
        );

        expect(ordenados[0].id).toBe('vencido');
    });

    it('deve priorizar vencidos em lista com múltiplos não vencidos', () => {
        const referencia = new Date(2026, 6, 20);
        const ordenados = ordenarFeriasVencidosPrimeiro(
            [
                { id: 'futuro-1', leaveReturnDate: new Date(2026, 8, 1) },
                { id: 'futuro-2', leaveReturnDate: new Date(2026, 7, 15) },
                { id: 'vencido', leaveReturnDate: new Date(2026, 5, 1) }
            ],
            referencia
        );

        expect(ordenados[0].id).toBe('vencido');
        expect(ordenados.slice(1).every((funcionario) => funcionario.id.startsWith('futuro'))).toBe(
            true
        );
    });

    it('deve manter ordem por timestamp quando nenhum vencido está presente', () => {
        const referencia = new Date('2026-07-20T12:00:00.000Z');
        const ordenados = ordenarFeriasVencidosPrimeiro(
            [
                { id: '1', leaveReturnDate: new Date('2026-09-01') },
                { id: '2', leaveReturnDate: new Date('2026-08-01') }
            ],
            referencia
        );

        expect(ordenados.map((funcionario) => funcionario.id)).toEqual(['2', '1']);
    });
});
