import prisma from '../../src/config/database.js';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('Iniciando seed de administrador...');

    const adminEmail = 'admin@rhsystem.com';
    const adminPassword = 'admin';
    const adminName = 'Administrador do Sistema';

    // Verifica se o administrador já existe
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (existingAdmin) {
        console.log(`O usuário administrador com o email ${adminEmail} já existe.`);
        return;
    }

    // Gera o hash da senha
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Cria o usuário administrador
    const admin = await prisma.user.create({
        data: {
            name: adminName,
            email: adminEmail,
            passwordHash: passwordHash,
            role: 'ADMIN',
            isActive: true
        }
    });

    console.log(`✅ Usuário administrador criado com sucesso!`);
    console.log(`-------------------------------------------`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Senha: ${adminPassword}`);
    console.log(`-------------------------------------------`);
    console.log(`Lembre-se de alterar a senha após o primeiro login.`);
}

main()
    .catch((e) => {
        console.error('❌ Erro ao criar administrador:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
