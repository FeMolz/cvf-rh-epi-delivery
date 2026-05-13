import prisma from '../../src/config/database.js';

async function main() {
    try {
        const company = await prisma.company.create({
            data: {
                name: "Empresa Teste S.A.",
                cnpj: "12.345.678/0001-99"
            }
        });

        const role = await prisma.role.create({
            data: {
                name: "Analista de Sistemas",
                description: "Responsável pelo desenvolvimento e manutenção."
            }
        });

        console.log("\n=== DADOS GERADOS COM SUCESSO ===");
        console.log(`companyId: "${company.id}"`);
        console.log(`roleId: "${role.id}"`);
        console.log("=================================\n");
    } catch (error) {
        console.error("Erro ao criar dados:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
