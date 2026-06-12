import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';
import { obterConteudoPdfMinimoSeed } from './dados/conteudoPdfMinimoSeed.js';
import {
    EMAIL_ADMIN_PADRAO,
    ID_ENTREGA_EPI_ANA_CAPACETE,
    ID_EPI_CAPACETE,
    ID_EPI_LUVA,
    ID_FUNCIONARIO_ANA,
    ID_FUNCIONARIO_BRUNO,
    ID_RELATORIO_EPI_ANA,
    ID_USUARIO_ALMOXARIFADO
} from './dados/identificadoresSeedConstantes.js';

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

    const dataEntregaAna = new Date('2025-01-15');
    const proximoVencimentoAna = new Date('2026-01-15');

    await prisma.epiDelivery.upsert({
        where: { id: ID_ENTREGA_EPI_ANA_CAPACETE },
        update: {
            employeeId: ID_FUNCIONARIO_ANA,
            epiId: ID_EPI_CAPACETE,
            deliveredById: entregadorId,
            deliveryDate: dataEntregaAna,
            nextDueDate: proximoVencimentoAna,
            termSigned: false
        },
        create: {
            id: ID_ENTREGA_EPI_ANA_CAPACETE,
            employeeId: ID_FUNCIONARIO_ANA,
            epiId: ID_EPI_CAPACETE,
            deliveredById: entregadorId,
            deliveryDate: dataEntregaAna,
            nextDueDate: proximoVencimentoAna,
            termSigned: false
        }
    });

    console.log('- Entrega de EPI para Ana Silva sincronizada.');

    const entregaBrunoExistente = await prisma.epiDelivery.findFirst({
        where: {
            employeeId: ID_FUNCIONARIO_BRUNO,
            epiId: ID_EPI_LUVA
        }
    });

    if (!entregaBrunoExistente) {
        await prisma.epiDelivery.create({
            data: {
                employeeId: ID_FUNCIONARIO_BRUNO,
                epiId: ID_EPI_LUVA,
                deliveredById: entregadorId,
                deliveryDate: new Date('2025-02-01'),
                nextDueDate: new Date('2025-05-01'),
                termSigned: true
            }
        });

        console.log('- Entrega de EPI para Bruno Costa criada.');
    }

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
