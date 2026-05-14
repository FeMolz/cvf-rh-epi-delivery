import prisma from '../../../../config/database.js';

class UnlinkEpiFromRoleService {
    async execute({ roleId, epiId }) {
        if (!roleId || !epiId) {
            throw new Error('roleId e epiId são obrigatórios.');
        }

        const existingLink = await prisma.roleEpi.findUnique({
            where: {
                roleId_epiId: {
                    roleId,
                    epiId
                }
            }
        });

        if (!existingLink) {
            throw new Error('Vínculo entre este Cargo e EPI não encontrado.');
        }

        await prisma.roleEpi.delete({
            where: {
                roleId_epiId: {
                    roleId,
                    epiId
                }
            }
        });

        return { message: 'Vínculo removido com sucesso.' };
    }
}

export default new UnlinkEpiFromRoleService();
