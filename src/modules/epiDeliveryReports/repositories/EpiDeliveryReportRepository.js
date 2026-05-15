import prisma from '../../../config/database.js';

const SELECAO_FUNCIONARIO_RELATORIO = {
    id: true,
    name: true,
    cpf: true,
    role: { select: { name: true } },
    company: { select: { name: true } }
};

const SELECAO_USUARIO_GERADOR = {
    id: true,
    name: true,
    email: true
};

const SELECAO_RELATORIO_SEM_PDF = {
    id: true,
    employeeId: true,
    periodStartDate: true,
    periodEndDate: true,
    foiImpresso: true,
    foiEncaminhado: true,
    foiAssinado: true,
    generatedByUserId: true,
    createdAt: true,
    updatedAt: true
};

class EpiDeliveryReportRepository {
    /**
     * @param {string} identificadorFuncionario
     */
    async findEmployeeContextForReport(identificadorFuncionario) {
        return prisma.employee.findFirst({
            where: { id: identificadorFuncionario, deletedAt: null },
            select: {
                id: true,
                name: true,
                cpf: true,
                role: { select: { name: true } },
                company: { select: { name: true } }
            }
        });
    }

    /**
     * @param {object} dadosRelatorio
     */
    async createReport(dadosRelatorio) {
        return prisma.epiDeliveryReport.create({
            data: dadosRelatorio,
            select: {
                ...SELECAO_RELATORIO_SEM_PDF,
                employee: { select: SELECAO_FUNCIONARIO_RELATORIO },
                generatedBy: { select: SELECAO_USUARIO_GERADOR }
            }
        });
    }

    async findAllPendingSignatureOrdered() {
        return prisma.epiDeliveryReport.findMany({
            where: { foiAssinado: false },
            orderBy: { createdAt: 'desc' },
            select: {
                ...SELECAO_RELATORIO_SEM_PDF,
                employee: { select: SELECAO_FUNCIONARIO_RELATORIO },
                generatedBy: { select: SELECAO_USUARIO_GERADOR }
            }
        });
    }

    /**
     * @param {string} identificadorFuncionario
     */
    async findArchiveByEmployeeId(identificadorFuncionario) {
        return prisma.epiDeliveryReport.findMany({
            where: { employeeId: identificadorFuncionario },
            orderBy: { createdAt: 'desc' },
            select: {
                ...SELECAO_RELATORIO_SEM_PDF,
                generatedBy: { select: SELECAO_USUARIO_GERADOR }
            }
        });
    }

    /**
     * @param {string} identificadorRelatorio
     */
    async findById(identificadorRelatorio) {
        return prisma.epiDeliveryReport.findUnique({
            where: { id: identificadorRelatorio },
            select: {
                ...SELECAO_RELATORIO_SEM_PDF,
                employee: { select: SELECAO_FUNCIONARIO_RELATORIO }
            }
        });
    }

    /**
     * @param {string} identificadorRelatorio
     */
    async findByIdComPdfBinarioParaDownload(identificadorRelatorio) {
        return prisma.epiDeliveryReport.findUnique({
            where: { id: identificadorRelatorio },
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                pdfConteudo: true,
                employee: { select: { name: true } }
            }
        });
    }

    /**
     * @param {string} identificadorRelatorio
     * @param {object} dadosParciais
     */
    async updateFlagsById(identificadorRelatorio, dadosParciais) {
        return prisma.epiDeliveryReport.update({
            where: { id: identificadorRelatorio },
            data: dadosParciais,
            select: {
                ...SELECAO_RELATORIO_SEM_PDF,
                employee: { select: SELECAO_FUNCIONARIO_RELATORIO }
            }
        });
    }
}

export default new EpiDeliveryReportRepository();
