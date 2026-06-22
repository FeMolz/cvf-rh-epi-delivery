import prisma from '../../../config/database.js';
import {
    STATUS_FUNCIONARIO_AFASTAMENTO_TEMPORARIO,
    STATUS_FUNCIONARIO_INATIVOS
} from '../../employees/constants/funcionarioStatusConstantes.js';

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

    async findFuncionariosEmAfastamentoTemporario() {
        return prisma.employee.findMany({
            where: {
                deletedAt: null,
                status: {
                    in: STATUS_FUNCIONARIO_AFASTAMENTO_TEMPORARIO
                }
            },
            select: {
                id: true,
                name: true,
                status: true,
                leaveReturnDate: true,
                company: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    }
}

export default new NoticiasRepository();
