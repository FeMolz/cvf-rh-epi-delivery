import prisma from '../../../config/database.js';
import { possuiEntregaPendenteEmissao } from '../utils/coberturaEntregaRelatorio.js';

const SELECAO_FUNCIONARIO_RELATORIO = {
    id: true,
    name: true,
    cpf: true,
    role: { select: { name: true } },
    company: { select: { name: true } },
    setor: { select: { nome: true } }
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
        const funcionario = await prisma.employee.findUnique({
            where: { id: identificadorFuncionario },
            select: {
                id: true,
                name: true,
                cpf: true,
                deletedAt: true,
                role: { select: { name: true } },
                company: { select: { name: true } },
                setor: { select: { nome: true } }
            }
        });

        if (!funcionario || funcionario.deletedAt) {
            return null;
        }

        const contextoRelatorio = { ...funcionario };
        delete contextoRelatorio.deletedAt;
        return contextoRelatorio;
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
     * @param {{
     *   employeeId?: string,
     *   foiAssinado?: boolean,
     *   emissaoInicio?: Date,
     *   emissaoFim?: Date,
     *   ultimosDias?: number,
     *   pagina?: number,
     *   limite?: number
     * }} filtros
     */
    async findManyComFiltros(filtros = {}) {
        const where = {};

        if (filtros.employeeId) {
            where.employeeId = filtros.employeeId;
        }

        if (typeof filtros.foiAssinado === 'boolean') {
            where.foiAssinado = filtros.foiAssinado;
        }

        if (filtros.emissaoInicio || filtros.emissaoFim || filtros.ultimosDias) {
            where.createdAt = {};

            if (filtros.emissaoInicio) {
                where.createdAt.gte = filtros.emissaoInicio;
            }

            if (filtros.emissaoFim) {
                where.createdAt.lte = filtros.emissaoFim;
            }

            if (filtros.ultimosDias) {
                const limiteRecente = new Date();
                limiteRecente.setUTCDate(limiteRecente.getUTCDate() - filtros.ultimosDias);
                limiteRecente.setUTCHours(0, 0, 0, 0);
                where.createdAt.gte = limiteRecente;
            }
        }

        const pagina = filtros.pagina ?? 1;
        const limite = filtros.limite ?? 20;
        const deslocamento = (pagina - 1) * limite;

        const [itens, totalItens] = await Promise.all([
            prisma.epiDeliveryReport.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: deslocamento,
                take: limite,
                select: {
                    ...SELECAO_RELATORIO_SEM_PDF,
                    employee: { select: SELECAO_FUNCIONARIO_RELATORIO },
                    generatedBy: { select: SELECAO_USUARIO_GERADOR }
                }
            }),
            prisma.epiDeliveryReport.count({ where })
        ]);

        return {
            itens,
            pagina,
            limite,
            totalItens,
            totalPaginas: Math.max(1, Math.ceil(totalItens / limite))
        };
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

    async findFuncionariosElegiveisEmissaoRelatorio() {
        const funcionarios = await prisma.employee.findMany({
            where: {
                deletedAt: null,
                epiDeliveries: { some: {} }
            },
            select: {
                id: true,
                name: true,
                roleId: true,
                role: { select: { name: true } },
                epiDeliveries: { select: { deliveryDate: true } },
                epiDeliveryReports: {
                    select: {
                        periodStartDate: true,
                        periodEndDate: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return funcionarios
            .filter((funcionario) =>
                possuiEntregaPendenteEmissao(funcionario.epiDeliveries, funcionario.epiDeliveryReports)
            )
            .map((funcionario) => ({
                id: funcionario.id,
                name: funcionario.name,
                roleId: funcionario.roleId,
                roleName: funcionario.role?.name || '—'
            }));
    }

    async findFuncionariosComHistoricoEmissoes() {
        const agregados = await prisma.epiDeliveryReport.groupBy({
            by: ['employeeId'],
            _count: { id: true }
        });

        if (!agregados.length) {
            return [];
        }

        const mapaContagem = new Map(
            agregados.map((item) => [item.employeeId, item._count.id])
        );

        const funcionarios = await prisma.employee.findMany({
            where: {
                deletedAt: null,
                id: { in: [...mapaContagem.keys()] }
            },
            select: {
                id: true,
                name: true,
                role: { select: { name: true } }
            },
            orderBy: { name: 'asc' }
        });

        return funcionarios.map((funcionario) => ({
            id: funcionario.id,
            name: funcionario.name,
            roleName: funcionario.role?.name || '—',
            totalEmissoes: mapaContagem.get(funcionario.id) || 0
        }));
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
