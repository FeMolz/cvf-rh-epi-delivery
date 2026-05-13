import prisma from '../../../config/database.js';

class CompanyController {
    async findAll(req, res) {
        try {
            // Retorna apenas as empresas cadastradas no banco (read-only)
            const companies = await prisma.company.findMany({
                select: {
                    id: true,
                    name: true,
                    cnpj: true,
                    isActive: true
                },
                orderBy: {
                    name: 'asc'
                }
            });

            return res.json(companies);

        } catch (error) {
            console.error('Error finding companies:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default new CompanyController();
