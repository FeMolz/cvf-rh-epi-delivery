import prisma from '../../../config/database.js';
import { STATUS_FUNCIONARIO_INATIVOS } from '../../employees/constants/funcionarioStatusConstantes.js';

const SELECAO_FUNCIONARIO_ANIVERSARIOS = {
    id: true,
    name: true,
    birthDate: true,
    admissionDate: true,
    company: {
        select: {
            name: true
        }
    }
};

class NoticiasRepository {
    async findFuncionariosElegiveisAniversarios() {
        return prisma.employee.findMany({
            where: {
                deletedAt: null,
                status: {
                    notIn: STATUS_FUNCIONARIO_INATIVOS
                }
            },
            select: SELECAO_FUNCIONARIO_ANIVERSARIOS,
            orderBy: { name: 'asc' }
        });
    }
}

export default new NoticiasRepository();
