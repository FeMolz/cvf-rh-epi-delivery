import employeeRepository from '../repositories/EmployeeRepository.js';

class CreateEmployeeService {
    async execute({ name, cpf, status, admissionDate, resignationDate, companyId, roleId }) {

        if (!name || !cpf || !companyId || !roleId) {
            throw new Error('Campos obrigatórios ausentes: name, cpf, companyId, roleId');
        }

        const matches = await employeeRepository.findAll();
        if (matches.some(emp => emp.cpf === cpf)) {
            throw new Error('CPF já cadastrado no sistema');
        }
        const employee = await employeeRepository.create({
            name,
            cpf,
            status: status || 'ATIVO',
            admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
            resignationDate: resignationDate ? new Date(resignationDate) : null,
            companyId,
            roleId
        });
        return employee;
    }
}

export default new CreateEmployeeService();
