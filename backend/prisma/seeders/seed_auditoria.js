import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';
import { EMAIL_ADMIN_PADRAO } from './dados/identificadoresSeedConstantes.js';

const eventosAuditoriaDados = [
    {
        tipoEvento: 'LOGIN_SUCESSO',
        detalhes: { email: EMAIL_ADMIN_PADRAO, origem: 'seed' }
    },
    {
        tipoEvento: 'CONVITE_CADASTRO_GERADO',
        detalhes: { candidaturaId: 'seed', origem: 'seed' }
    },
    {
        tipoEvento: 'DOWNLOAD_CURRICULO',
        detalhes: { candidaturaId: 'seed', origem: 'seed' }
    }
];

async function main() {
    console.log('Iniciando seed de eventos de auditoria...');

    const quantidadeExistente = await prisma.eventoAuditoriaSeguranca.count({
        where: { tipoEvento: { in: eventosAuditoriaDados.map((evento) => evento.tipoEvento) } }
    });

    if (quantidadeExistente >= eventosAuditoriaDados.length) {
        console.log('- Eventos de auditoria de exemplo já existem. Nenhuma alteração.');
        return;
    }

    for (const evento of eventosAuditoriaDados) {
        await prisma.eventoAuditoriaSeguranca.create({
            data: evento
        });

        console.log(`- Evento "${evento.tipoEvento}" registrado.`);
    }

    console.log('\n=== AUDITORIA DE SEGURANÇA ATUALIZADA ===');
}

main()
    .catch((erro) => {
        console.error('Erro no seed de auditoria:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
