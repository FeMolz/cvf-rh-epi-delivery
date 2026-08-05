import { jest } from '@jest/globals';
import { montarFiltroConsultaFuncionarios } from './montarFiltroConsultaFuncionarios.js';

describe('montarFiltroConsultaFuncionarios', () => {
    it('deve filtrar apenas ATIVO no filtro ativos', () => {
        expect(montarFiltroConsultaFuncionarios('ativos')).toEqual({
            status: { in: ['ATIVO'] }
        });
    });

    it('deve filtrar afastados', () => {
        expect(montarFiltroConsultaFuncionarios('afastados')).toEqual({
            status: { in: ['FERIAS', 'LICENCA_MATERNIDADE', 'LICENCA_MED'] }
        });
    });

    it('deve usar filtro ativos por padrão', () => {
        expect(montarFiltroConsultaFuncionarios()).toEqual({
            status: { in: ['ATIVO'] }
        });
        expect(montarFiltroConsultaFuncionarios(null)).toEqual({
            status: { in: ['ATIVO'] }
        });
    });

    it('deve mapear filtros individuais de status', () => {
        expect(montarFiltroConsultaFuncionarios('ferias')).toEqual({ status: 'FERIAS' });
        expect(montarFiltroConsultaFuncionarios('licenca_maternidade')).toEqual({
            status: 'LICENCA_MATERNIDADE'
        });
        expect(montarFiltroConsultaFuncionarios('licenca_med')).toEqual({ status: 'LICENCA_MED' });
        expect(montarFiltroConsultaFuncionarios('inativos')).toEqual({
            status: { in: ['INATIVO', 'DESLIGADO', 'RESCINDIDO', 'APOSENTADO'] }
        });
        expect(montarFiltroConsultaFuncionarios('todos')).toEqual({});
        expect(montarFiltroConsultaFuncionarios('ativo')).toEqual({ status: 'ATIVO' });
        expect(montarFiltroConsultaFuncionarios('inativo')).toEqual({ status: 'INATIVO' });
        expect(montarFiltroConsultaFuncionarios('desligado')).toEqual({ status: 'DESLIGADO' });
        expect(montarFiltroConsultaFuncionarios('demitido')).toEqual({ status: 'DESLIGADO' });
        expect(montarFiltroConsultaFuncionarios('rescindido')).toEqual({ status: 'RESCINDIDO' });
        expect(montarFiltroConsultaFuncionarios('aposentado')).toEqual({ status: 'APOSENTADO' });
    });

    it('deve rejeitar filtro inválido', () => {
        expect(() => montarFiltroConsultaFuncionarios('invalido')).toThrow(
            'Filtro de funcionários inválido'
        );
    });

    it('deve retornar objeto vazio para filtro válido sem entrada no mapa', async () => {
        jest.resetModules();
        const constantesReais = await import('../constants/funcionarioStatusConstantes.js');
        jest.unstable_mockModule('../constants/funcionarioStatusConstantes.js', () => ({
            ...constantesReais,
            FILTROS_LISTAGEM_FUNCIONARIOS: [
                ...constantesReais.FILTROS_LISTAGEM_FUNCIONARIOS,
                'filtro_sem_mapa'
            ]
        }));

        const { montarFiltroConsultaFuncionarios: montarFiltroMockado } = await import(
            './montarFiltroConsultaFuncionarios.js'
        );

        expect(montarFiltroMockado('filtro_sem_mapa')).toEqual({});
    });
});
