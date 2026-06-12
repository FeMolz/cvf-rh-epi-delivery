import './carregarAmbienteRaiz.js';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

import prisma from '../../src/config/database.js';

async function main() {
    console.log('Iniciando seed de administrador...');

    if (!process.env.DATABASE_URL) {
        console.error(
            'DATABASE_URL nao encontrada. Crie um arquivo .env na raiz do repositorio (ao lado de package.json) com a string de conexao do PostgreSQL.'
        );
        process.exit(1);
    }

    const ambienteProducao = process.env.NODE_ENV === 'production';
    const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@rhsystem.com';
    const adminPassword = process.env.ADMIN_SEED_PASSWORD;
    const adminName = process.env.ADMIN_SEED_NAME || 'Administrador do Sistema';

    if (!adminPassword) {
        if (ambienteProducao) {
            console.error(
                'ADMIN_SEED_PASSWORD é obrigatória para executar o seed em produção.'
            );
            process.exit(1);
        }

        console.warn(
            'ADMIN_SEED_PASSWORD não definida. Usando senha temporária apenas para desenvolvimento local.'
        );
    }

    const senhaFinal = adminPassword || 'AlterarSenha123!';

    if (senhaFinal.length < 8) {
        console.error('A senha do administrador deve ter no mínimo 8 caracteres.');
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(senhaFinal, 10);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            name: adminName,
            passwordHash,
            role: UserRole.ADMIN
        },
        create: {
            name: adminName,
            email: adminEmail,
            passwordHash,
            role: UserRole.ADMIN,
            isActive: false
        }
    });

    console.log('✅ Usuário administrador sincronizado com sucesso!');
    console.log('-------------------------------------------');
    console.log(`Email: ${adminEmail}`);
    if (!ambienteProducao) {
        console.log('Senha: definida via ADMIN_SEED_PASSWORD (não exibida por segurança).');
    }
    console.log('-------------------------------------------');
    console.log('Altere a senha após o primeiro login.');
}

main()
    .catch((erro) => {
        console.error('❌ Erro ao criar administrador:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
