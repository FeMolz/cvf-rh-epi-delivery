import './carregarAmbienteRaiz.js';

import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

import prisma from '../../src/config/database.js';
import {
    ID_USUARIO_ADMINISTRATIVO,
    ID_USUARIO_ALMOXARIFADO,
    ID_USUARIO_COLABORADOR,
    SENHA_USUARIO_SEED_PADRAO
} from './dados/identificadoresSeedConstantes.js';

const usuariosPapeis = [
    {
        id: ID_USUARIO_ADMINISTRATIVO,
        name: 'GESTOR ADMINISTRATIVO',
        email: 'administrativo@rhsystem.com',
        role: UserRole.ADMINISTRATIVO
    },
    {
        id: ID_USUARIO_ALMOXARIFADO,
        name: 'RESPONSÁVEL ALMOXARIFADO',
        email: 'almoxarifado@rhsystem.com',
        role: UserRole.ALMOXARIFADO
    },
    {
        id: ID_USUARIO_COLABORADOR,
        name: 'COLABORADOR EXEMPLO',
        email: 'colaborador@rhsystem.com',
        role: UserRole.COLABORADOR
    }
];

async function main() {
    console.log('Iniciando seed de usuários por papel...');

    const senhaHash = await bcrypt.hash(SENHA_USUARIO_SEED_PADRAO, 10);

    for (const usuario of usuariosPapeis) {
        await prisma.user.upsert({
            where: { email: usuario.email },
            update: {
                name: usuario.name,
                role: usuario.role,
                passwordHash: senhaHash
            },
            create: {
                id: usuario.id,
                name: usuario.name,
                email: usuario.email,
                role: usuario.role,
                passwordHash: senhaHash,
                isActive: false
            }
        });

        console.log(`- Usuário "${usuario.email}" (${usuario.role}) sincronizado.`);
    }

    console.log('\n=== USUÁRIOS POR PAPEL ATUALIZADOS ===');
    console.log(`Senha padrão dos usuários de seed: ${SENHA_USUARIO_SEED_PADRAO}`);
}

main()
    .catch((erro) => {
        console.error('Erro no seed de usuários por papel:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
