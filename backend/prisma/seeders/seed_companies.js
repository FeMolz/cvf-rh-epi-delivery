import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';

const companiesData = [
    { 
        id: "11111111-1111-1111-1111-111111111111",
        name: "Empresa 01 - Matriz", 
        cnpj: "11.111.111/0001-11" 
    },
    { 
        id: "22222222-2222-2222-2222-222222222222", 
        name: "Empresa 02 - Filial Sul", 
        cnpj: "22.222.222/0001-22" 
    },
    { 
        id: "33333333-3333-3333-3333-333333333333", 
        name: "Empresa 03 - Filial Norte", 
        cnpj: "33.333.333/0001-33" 
    },
    { 
        id: "44444444-4444-4444-4444-444444444444", 
        name: "Empresa 04 - Distribuidora", 
        cnpj: "44.444.444/0001-44" 
    }
];

async function main() {
    try {
        console.log("Iniciando o cadastro/atualização das 4 empresas...");

        for (const comp of companiesData) {
            // Verificar se o CNPJ já existe com outro ID (devido à execução anterior)
            const existing = await prisma.company.findUnique({ where: { cnpj: comp.cnpj } });
            if (existing && existing.id !== comp.id) {
                // Remove a antiga para dar lugar à nova com ID Fixo
                await prisma.company.delete({ where: { id: existing.id } });
            }

            await prisma.company.upsert({
                where: { id: comp.id }, 
                update: {
                    name: comp.name,
                    cnpj: comp.cnpj
                },
                create: {
                    id: comp.id,
                    name: comp.name,
                    cnpj: comp.cnpj
                }
            });
            console.log(`- Empresa "${comp.name}" sincronizada com segurança (UUID fixo).`);
        }

        console.log("\n=== TODAS AS EMPRESAS ATUALIZADAS NO BANCO ===");
        
    } catch (error) {
        console.error("Erro ao criar/atualizar empresas:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
