import prisma from '../../../config/database.js';

class ChangeEpiPeriodicityService {
    async execute({ roleId, epiId, newPeriodicityDays }) {
        if (!roleId || !epiId || newPeriodicityDays === undefined) {
            throw new Error('roleId, epiId e newPeriodicityDays são obrigatórios.');
        }

        if (newPeriodicityDays <= 0) {
            throw new Error('A periodicidade deve ser maior que zero.');
        }

        const roleEpi = await prisma.roleEpi.findUnique({
            where: {
                roleId_epiId: {
                    roleId,
                    epiId
                }
            }
        });

        if (!roleEpi) {
            throw new Error('Vínculo entre este Cargo e EPI não encontrado.');
        }

        const updatedRoleEpi = await prisma.roleEpi.update({
            where: {
                roleId_epiId: {
                    roleId,
                    epiId
                }
            },
            data: {
                periodicityDays: newPeriodicityDays
            }
        });

        return updatedRoleEpi;
    }
}

export default new ChangeEpiPeriodicityService();
