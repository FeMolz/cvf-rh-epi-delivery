import prisma from '../../../../config/database.js';
import fetchEpiFromApiService from '../../../epis/services/FetchEpiFromApiService.js';

class LinkEpiToRoleService {
    async execute({ roleId, caNumber, periodicityDays }) {
        if (!roleId || !caNumber || periodicityDays === undefined) {
            throw new Error('roleId, caNumber e periodicityDays são obrigatórios.');
        }

        // 1. Verifica se o Cargo existe
        const role = await prisma.role.findUnique({
            where: { id: roleId }
        });

        if (!role) {
            throw new Error('Cargo não encontrado.');
        }

        // 2. Busca o EPI localmente ou na API externa
        // O serviço cuidará de salvar na base local caso ainda não exista
        const epi = await fetchEpiFromApiService.execute(caNumber);

        // 3. Verifica se já existe o vínculo
        const existingLink = await prisma.roleEpi.findUnique({
            where: {
                roleId_epiId: {
                    roleId,
                    epiId: epi.id
                }
            }
        });

        if (existingLink) {
            throw new Error('Este EPI já está vinculado a este Cargo.');
        }

        // 4. Cria o vínculo
        const roleEpi = await prisma.roleEpi.create({
            data: {
                roleId,
                epiId: epi.id,
                periodicityDays
            },
            include: {
                epi: true,
                role: true
            }
        });

        return roleEpi;
    }
}

export default new LinkEpiToRoleService();
