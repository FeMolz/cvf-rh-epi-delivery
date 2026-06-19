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

    it('deve rejeitar filtro inválido', () => {
        expect(() => montarFiltroConsultaFuncionarios('invalido')).toThrow(
            'Filtro de funcionários inválido'
        );
    });
});
