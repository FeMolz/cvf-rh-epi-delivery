import prisma from '../../../config/database.js';
import epiProvider from '../../../shared/providers/EpiProvider/EpiProvider.js';

class FetchEpiFromApiService {
    async execute(caNumber) {
        // 1. Verifica se já existe na base local
        let epi = await prisma.epi.findUnique({
            where: { caNumber: String(caNumber) }
        });

        if (epi) {
            return epi;
        }

        // 2. Busca na API externa através do Provider
        const epiData = await epiProvider.getEpiByCa(caNumber);
        
        if (!epiData) {
            throw new Error('EPI com este CA não encontrado na base pública.');
        }

        // 3. Salva no banco de dados local
        epi = await prisma.epi.create({
            data: {
                caNumber: epiData.caNumber,
                name: epiData.name,
                caExpirationDate: epiData.expirationDate,
                isActive: epiData.isActive
            }
        });

        return epi;
    }
}

export default new FetchEpiFromApiService();
