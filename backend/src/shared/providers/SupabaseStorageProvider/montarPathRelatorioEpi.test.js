import { montarPathRelatorioEpi } from './montarPathRelatorioEpi.js';

describe('montarPathRelatorioEpi', () => {
    it('deve montar path com employeeId e reportId', () => {
        expect(montarPathRelatorioEpi('emp-1', 'rep-1')).toBe('emp-1/rep-1.pdf');
    });
});
