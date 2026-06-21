import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';
import { obterConteudoPdfMinimoSeed } from './dados/conteudoPdfMinimoSeed.js';
import {
    ENTREGAS_POR_FUNCIONARIO_SEED,
    QUANTIDADE_FUNCIONARIOS_SEED,
    gerarUuidDeterministico,
    listarFuncionariosSeed
} from './dados/conteudoVolumeSeedTeste.js';
import {
    EMAIL_ADMIN_PADRAO,
    ID_ENTREGA_EPI_ANA_CAPACETE,
    ID_FUNCIONARIO_ANA,
    ID_RELATORIO_EPI_ANA,
    ID_USUARIO_ALMOXARIFADO
} from './dados/identificadoresSeedConstantes.js';

async function obterEpisDoCargo(roleId) {
    const vinculos = await prisma.roleEpi.findMany({
        where: { roleId },
        orderBy: { epiId: 'asc' }
    });

    return vinculos.map((vinculo) => vinculo.epiId);
}

async function main() {
    console.log('Iniciando seed de entregas e relatórios de EPI...');

    const usuarioAdmin = await prisma.user.findUnique({
        where: { email: EMAIL_ADMIN_PADRAO }
    });

    const usuarioAlmoxarifado = await prisma.user.findUnique({
        where: { id: ID_USUARIO_ALMOXARIFADO }
    });

    const entregadorId = usuarioAlmoxarifado?.id ?? usuarioAdmin?.id;

    if (!entregadorId) {
        throw new Error('Nenhum usuário encontrado para registrar entregas de EPI.');
    }

    const idsFuncionariosSeed = listarFuncionariosSeed().map((funcionario) => funcionario.id);

    const funcionarios = await prisma.employee.findMany({
        where: {
            id: { in: idsFuncionariosSeed },
            deletedAt: null
        },
        orderBy: { id: 'asc' }
    });

    let totalEntregas = 0;

    for (const [indiceFuncionario, funcionario] of funcionarios.entries()) {
        const episDoCargo = await obterEpisDoCargo(funcionario.roleId);

        if (episDoCargo.length === 0) {
            throw new Error(
                `Cargo do funcionário "${funcionario.name}" não possui EPIs vinculados para gerar entregas.`
            );
        }

        for (let indiceEntrega = 0; indiceEntrega < ENTREGAS_POR_FUNCIONARIO_SEED; indiceEntrega += 1) {
            const epiId = episDoCargo[indiceEntrega % episDoCargo.length];
            const sequenciaEntrega = indiceFuncionario * ENTREGAS_POR_FUNCIONARIO_SEED + indiceEntrega + 1;
            const idEntrega =
                funcionario.id === ID_FUNCIONARIO_ANA && indiceEntrega === 0
                    ? ID_ENTREGA_EPI_ANA_CAPACETE
                    : gerarUuidDeterministico('f1000000', sequenciaEntrega);

            const mesEntrega = (indiceEntrega % 12) + 1;
            const dataEntrega = new Date(2024, mesEntrega - 1, 10 + indiceEntrega);
            const proximoVencimento = new Date(dataEntrega);
            proximoVencimento.setMonth(proximoVencimento.getMonth() + 3);

            await prisma.epiDelivery.upsert({
                where: { id: idEntrega },
                update: {
                    employeeId: funcionario.id,
                    epiId,
                    deliveredById: entregadorId,
                    deliveryDate: dataEntrega,
                    nextDueDate: proximoVencimento,
                    termSigned: indiceEntrega % 2 === 0
                },
                create: {
                    id: idEntrega,
                    employeeId: funcionario.id,
                    epiId,
                    deliveredById: entregadorId,
                    deliveryDate: dataEntrega,
                    nextDueDate: proximoVencimento,
                    termSigned: indiceEntrega % 2 === 0
                }
            });

            totalEntregas += 1;
        }
    }

    console.log(
        `- ${totalEntregas} entregas sincronizadas (${ENTREGAS_POR_FUNCIONARIO_SEED} por funcionário; ${funcionarios.length}/${QUANTIDADE_FUNCIONARIOS_SEED} funcionários do seed).`
    );

    const periodoInicio = new Date('2025-01-01');
    const periodoFim = new Date('2025-03-31');
    const conteudoPdf = obterConteudoPdfMinimoSeed();

    await prisma.epiDeliveryReport.upsert({
        where: { id: ID_RELATORIO_EPI_ANA },
        update: {
            employeeId: ID_FUNCIONARIO_ANA,
            periodStartDate: periodoInicio,
            periodEndDate: periodoFim,
            pdfConteudo: conteudoPdf,
            generatedByUserId: usuarioAdmin?.id ?? null,
            foiImpresso: false,
            foiEncaminhado: true,
            foiAssinado: false
        },
        create: {
            id: ID_RELATORIO_EPI_ANA,
            employeeId: ID_FUNCIONARIO_ANA,
            periodStartDate: periodoInicio,
            periodEndDate: periodoFim,
            pdfConteudo: conteudoPdf,
            generatedByUserId: usuarioAdmin?.id ?? null,
            foiImpresso: false,
            foiEncaminhado: true,
            foiAssinado: false
        }
    });

    console.log('- Relatório PDF de EPI para Ana Silva sincronizado.');
    console.log('\n=== ENTREGAS E RELATÓRIOS DE EPI ATUALIZADOS ===');
}

main()
    .catch((erro) => {
        console.error('Erro no seed de entregas de EPI:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
