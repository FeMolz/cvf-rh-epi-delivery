import employeeRepository from '../repositories/EmployeeRepository.js';

class CreateEmployeeService {
    async execute({ name, cpf, status, admissionDate, resignationDate, companyId }) {

        if (!name || !cpf || !companyId) {
            throw new Error('Campos obrigatórios ausentes: name, cpf, companyId');
        }

        const matches = await employeeRepository.findAll();
        if (matches.some(emp => emp.cpf === cpf)) {
            throw new Error('CPF já cadastrado no sistema');
        }
        const employee = await employeeRepository.create({
            name,
            cpf,
            status: status || 'ATIVO',
            admissionDate,
            resignationDate,
            companyId
        });
        return employee;
    }
}

export default new CreateEmployeeService();
