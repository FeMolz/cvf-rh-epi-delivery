import bcrypt from 'bcryptjs';

import prisma from '../../../../config/database.js';

/**
 * @param {{ sufixo: string, role?: string, senha?: string }} parametros
 */
export async function criarUsuarioIntegracao({ sufixo, role = 'ALMOXARIFADO', senha = 'SenhaIntegra123' }) {
    const passwordHash = await bcrypt.hash(senha, 10);

    return prisma.user.create({
        data: {
            name: `Usuário Integração ${sufixo}`,
            email: `usuario-${sufixo}@integracao.test`,
            passwordHash,
            role,
            isActive: true
        }
    });
}
