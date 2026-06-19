import ExcelJS from 'exceljs';

import {
    ROTULOS_COLUNAS_LISTA_FUNCIONARIOS,
    ROTULOS_FICHA_FUNCIONARIO
} from '../../../modules/employees/constants/funcionarioExportacaoConstantes.js';

class PlanilhaFuncionarioProvider {
    /**
     * @param {Array<{ nome: string, cargo: string, setor: string, status: string, dataDemissao: string }>} linhas
     * @returns {Promise<Buffer>}
     */
    async gerarPlanilhaListaFuncionarios(linhas) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Funcionários');

        worksheet.columns = [
            { header: ROTULOS_COLUNAS_LISTA_FUNCIONARIOS.nome, key: 'nome', width: 36 },
            { header: ROTULOS_COLUNAS_LISTA_FUNCIONARIOS.cargo, key: 'cargo', width: 28 },
            { header: ROTULOS_COLUNAS_LISTA_FUNCIONARIOS.setor, key: 'setor', width: 22 },
            { header: ROTULOS_COLUNAS_LISTA_FUNCIONARIOS.status, key: 'status', width: 18 },
            {
                header: ROTULOS_COLUNAS_LISTA_FUNCIONARIOS.dataDemissao,
                key: 'dataDemissao',
                width: 18
            }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.addRows(linhas);

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * @param {import('exceljs').Workbook} workbook
     * @param {string} tituloPlanilha
     * @param {Array<{ campo: string, valor: string }>} paresCampoValor
     */
    adicionarFichaAoWorkbook(workbook, tituloPlanilha, paresCampoValor) {
        const worksheet = workbook.addWorksheet(tituloPlanilha);

        worksheet.columns = [
            { header: 'Campo', key: 'campo', width: 32 },
            { header: 'Valor', key: 'valor', width: 48 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.addRows(paresCampoValor);
    }

    /**
     * @param {string} tituloBase
     * @param {Set<string>} titulosUsados
     * @returns {string}
     */
    montarTituloAbaPlanilha(tituloBase, titulosUsados) {
        const tituloSanitizado = String(tituloBase || 'Funcionario')
            .replace(/[:\\/?*[\]]/g, '-')
            .trim()
            .slice(0, 31);

        let titulo = tituloSanitizado || 'Funcionario';
        let sufixo = 2;

        while (titulosUsados.has(titulo)) {
            const base = tituloSanitizado.slice(0, Math.max(1, 31 - String(sufixo).length - 1));
            titulo = `${base}-${sufixo}`;
            sufixo += 1;
        }

        titulosUsados.add(titulo);
        return titulo;
    }

    /**
     * @param {string} tituloPlanilha
     * @param {Array<{ campo: string, valor: string }>} paresCampoValor
     * @returns {Promise<Buffer>}
     */
    async gerarPlanilhaFichaFuncionario(tituloPlanilha, paresCampoValor) {
        const workbook = new ExcelJS.Workbook();
        this.adicionarFichaAoWorkbook(workbook, tituloPlanilha, paresCampoValor);

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * @param {Array<{ tituloBase: string, paresCampoValor: Array<{ campo: string, valor: string }> }>} fichas
     * @returns {Promise<Buffer>}
     */
    async gerarPlanilhaFichasFuncionarios(fichas) {
        const workbook = new ExcelJS.Workbook();
        const titulosUsados = new Set();

        for (const ficha of fichas) {
            const titulo = this.montarTituloAbaPlanilha(ficha.tituloBase, titulosUsados);
            this.adicionarFichaAoWorkbook(workbook, titulo, ficha.paresCampoValor);
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * @param {string} nomeFuncionario
     * @returns {string}
     */
    sanitizarNomeArquivo(nomeFuncionario) {
        return nomeFuncionario
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9-_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .toLowerCase()
            .slice(0, 60);
    }
}

export { ROTULOS_FICHA_FUNCIONARIO };
export default new PlanilhaFuncionarioProvider();
