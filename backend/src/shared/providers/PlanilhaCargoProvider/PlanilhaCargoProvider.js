import ExcelJS from 'exceljs';

import { ROTULOS_COLUNAS_LISTA_CARGOS } from '../../../modules/roles/constants/roleConstantes.js';

class PlanilhaCargoProvider {
    /**
     * @param {Array<{ nome: string, descricao: string, epis: number, situacao: string, criadoEm: string, inativadoEm: string }>} linhas
     * @returns {Promise<Buffer>}
     */
    async gerarPlanilhaListaCargos(linhas) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Cargos');

        worksheet.columns = [
            { header: ROTULOS_COLUNAS_LISTA_CARGOS.nome, key: 'nome', width: 32 },
            { header: ROTULOS_COLUNAS_LISTA_CARGOS.descricao, key: 'descricao', width: 40 },
            { header: ROTULOS_COLUNAS_LISTA_CARGOS.epis, key: 'epis', width: 16 },
            { header: ROTULOS_COLUNAS_LISTA_CARGOS.situacao, key: 'situacao', width: 14 },
            { header: ROTULOS_COLUNAS_LISTA_CARGOS.criadoEm, key: 'criadoEm', width: 18 },
            { header: ROTULOS_COLUNAS_LISTA_CARGOS.inativadoEm, key: 'inativadoEm', width: 18 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.addRows(linhas);

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}

export default new PlanilhaCargoProvider();
