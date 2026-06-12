import './carregarAmbienteRaiz.js';

import jwt from 'jsonwebtoken';

import env from '../../src/config/env.js';
import prisma from '../../src/config/database.js';
import { EMAIL_ADMIN_PADRAO } from './dados/identificadoresSeedConstantes.js';

if (env.NODE_ENV === 'production') {
    console.error('Este script não pode ser executado em produção.');
    process.exit(1);
}

async function main() {
    const emailAdmin = process.env.ADMIN_SEED_EMAIL || EMAIL_ADMIN_PADRAO;

    const usuarioAdmin = await prisma.user.findUnique({
        where: { email: emailAdmin },
        select: { id: true, email: true, role: true }
    });

    if (!usuarioAdmin) {
        console.error(
            `Usuário admin não encontrado (${emailAdmin}). Execute npm run seed:all:test antes.`
        );
        process.exit(1);
    }

    const token = jwt.sign(
        {
            id: usuarioAdmin.id,
            role: usuarioAdmin.role,
            email: usuarioAdmin.email
        },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN || '7d' }
    );

    console.log('\n--- TOKEN DE TESTE (usuário admin real no banco) ---');
    console.log(`Usuário: ${usuarioAdmin.email} (${usuarioAdmin.id})`);
    console.log('Bearer ' + token);
    console.log('----------------------------------------------------\n');
}

main()
    .catch((erro) => {
        console.error('Erro ao gerar token de desenvolvimento:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
