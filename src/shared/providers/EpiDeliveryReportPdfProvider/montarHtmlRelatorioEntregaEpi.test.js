import { montarHtmlRelatorioEntregaEpi } from './montarHtmlRelatorioEntregaEpi.js';

describe('montarHtmlRelatorioEntregaEpi', () => {
    it('deve incluir dados do funcionário, empresa, cargo, setor e assinaturas', () => {
        const html = montarHtmlRelatorioEntregaEpi({
            nomeFuncionario: 'Maria Silva',
            nomeEmpresa: 'CVF Indústria',
            nomeCargo: 'Operador de Máquinas',
            nomeSetor: 'Produção',
            textoPeriodoReferencia: '01/02/2026 a 15/02/2026',
            entregasTabela: [
                {
                    dataEntrega: '05/02/2026',
                    nomeEquipamento: 'Capacete',
                    numeroCa: '11070'
                }
            ]
        });

        expect(html).toContain('Maria Silva');
        expect(html).toContain('CVF Indústria');
        expect(html).toContain('Operador de Máquinas');
        expect(html).toContain('Produção');
        expect(html).toContain('01/02/2026 a 15/02/2026');
        expect(html).toContain('Capacete');
        expect(html).toContain('11070');
        expect(html).toContain('class="assinaturas"');
        expect(html).toContain('Assinatura do funcionário');
        expect(html).toContain('Assinatura do RH / SST');
        expect(html).toContain('@page');
    });

    it('deve escapar HTML malicioso nos nomes', () => {
        const html = montarHtmlRelatorioEntregaEpi({
            nomeFuncionario: '<b onclick="x">João</b>',
            nomeEmpresa: 'Empresa',
            nomeCargo: 'Cargo',
            nomeSetor: 'Setor',
            textoPeriodoReferencia: '01/02/2026 a 02/02/2026',
            entregasTabela: []
        });

        expect(html).not.toContain('<b onclick');
        expect(html).toContain('&lt;b onclick');
    });

    it('deve exibir mensagem quando não houver entregas', () => {
        const html = montarHtmlRelatorioEntregaEpi({
            nomeFuncionario: 'Ana',
            nomeEmpresa: 'Empresa',
            nomeCargo: 'Cargo',
            nomeSetor: 'Setor',
            textoPeriodoReferencia: '01/02/2026 a 02/02/2026',
            entregasTabela: []
        });

        expect(html).toContain('Nenhuma entrega registrada neste intervalo.');
        expect(html).toContain('celula-vazia');
    });
});
