import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';
import linkEpiToRoleService from '../../src/modules/chaining/epiToRole/services/LinkEpiToRoleService.js';
import { CAS_REAIS_EPIS_SEED } from './dados/casReaisEpiSeedConstantes.js';

async function main() {
    console.log('Iniciando seed de EPIs aleatórios da API CAEPI...');

    // Busca um cargo existente (o primeiro que encontrar)
    const role = await prisma.role.findFirst();

    if (!role) {
        console.log('❌ Nenhum cargo encontrado no banco. Por favor, crie um cargo primeiro usando a API ou outro seeder.');
        return;
    }

    console.log(`▶ Cargo selecionado: ${role.name} (ID: ${role.id})`);

    // CAs reais da base pública CAEPI (capacetes, luvas, botinas, óculos, etc.)
    const selectedCAs = [...CAS_REAIS_EPIS_SEED].sort(() => 0.5 - Math.random()).slice(0, 5);

    console.log(`▶ CAs aleatórios sorteados para vinculação: ${selectedCAs.join(', ')}`);
    console.log(`-------------------------------------------`);

    for (const ca of selectedCAs) {
        try {
            // Gera uma periodicidade aleatória de troca entre 30 e 395 dias
            const periodicity = Math.floor(Math.random() * 365) + 30; 
            console.log(`Tentando vincular CA ${ca} com periodicidade de ${periodicity} dias...`);
            
            const result = await linkEpiToRoleService.execute({
                roleId: role.id,
                caNumber: ca,
                periodicityDays: periodicity
            });
            
            console.log(`✅ Sucesso! CA ${ca} baixado/vinculado.`);
        } catch (error) {
            console.log(`❌ Erro ao vincular CA ${ca}: ${error.message}`);
        }
    }

    console.log(`-------------------------------------------`);
    console.log('🏁 Seed de EPIs finalizado.');
}

main()
    .catch((e) => {
        console.error('Erro crítico no seeder:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
