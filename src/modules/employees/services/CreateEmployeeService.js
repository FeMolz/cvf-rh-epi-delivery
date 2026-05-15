import employeeRepository from '../repositories/EmployeeRepository.js';

class CreateEmployeeService {
    /**
     * @param {{ name: string, cpf: string, birthDate: string|Date, status?: string, admissionDate?: string|Date, resignationDate?: string|Date, companyId: string, roleId: string }} entrada
     */
    async execute(entrada) {
        const { name, cpf, status, admissionDate, resignationDate, companyId, roleId } = entrada;
        const { birthDate } = entrada;

        if (!name || !cpf || !companyId || !roleId) {
            throw new Error('Campos obrigatórios ausentes: name, cpf, companyId, roleId, birthDate');
        }

        if (birthDate === undefined || birthDate === null) {
            throw new Error('Campos obrigatórios ausentes: name, cpf, companyId, roleId, birthDate');
        }

        if (typeof birthDate === 'string' && birthDate.trim() === '') {
            throw new Error('Campos obrigatórios ausentes: name, cpf, companyId, roleId, birthDate');
        }

        const dataNascimento =
            birthDate instanceof Date
                ? birthDate
                : new Date(typeof birthDate === 'string' ? birthDate.trim() : birthDate);

        if (Number.isNaN(dataNascimento.getTime())) {
            throw new Error('Data de nascimento inválida.');
        }

        const matches = await employeeRepository.findAll();
        if (matches.some(emp => emp.cpf === cpf)) {
            throw new Error('CPF já cadastrado no sistema');
        }
        const employee = await employeeRepository.create({
            name,
            cpf,
            birthDate: dataNascimento,
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
