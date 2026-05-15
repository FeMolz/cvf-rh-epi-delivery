import prisma from '../../../config/database.js';

class EmployeeRepository {
    async create(data) {
        return prisma.employee.create({
            data,
            select: {
                id: true,
                name: true,
                cpf: true,
                birthDate: true,
                status: true,
                admissionDate: true,
                resignationDate: true,
                companyId: true,
                company: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }

    async findAll() {
        return prisma.employee.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                name: true,
                cpf: true,
                birthDate: true,
                status: true,
                admissionDate: true,
                resignationDate: true,
                companyId: true,
                company: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }

    async findById(id) {
        return prisma.employee.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                cpf: true,
                birthDate: true,
                status: true,
                admissionDate: true,
                resignationDate: true,
                companyId: true,
                company: true,
                deletedAt: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }

    async update(id, data) {
        return prisma.employee.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                cpf: true,
                birthDate: true,
                status: true,
                admissionDate: true,
                resignationDate: true,
                companyId: true,
                company: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }

    async delete(id) {
        const existing = await this.findById(id);
        if (!existing || existing.deletedAt) {
            const error = new Error('Funcionário não encontrado');
            error.code = 'NOT_FOUND';
            throw error;
        }
        // Aplica o Soft Delete: em vez de apagar do banco, preenche a data de exclusão
        return prisma.employee.update({
            where: { id },
            data: { 
                deletedAt: new Date(),
                status: 'DESLIGADO' // Opcional: já muda o status do funcionário
            }
        });
    }
}

export default new EmployeeRepository();