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
     * @param {string} tituloPlanilha
     * @param {Array<{ campo: string, valor: string }>} paresCampoValor
     * @returns {Promise<Buffer>}
     */
    async gerarPlanilhaFichaFuncionario(tituloPlanilha, paresCampoValor) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(tituloPlanilha);

        worksheet.columns = [
            { header: 'Campo', key: 'campo', width: 32 },
            { header: 'Valor', key: 'valor', width: 48 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.addRows(paresCampoValor);

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
