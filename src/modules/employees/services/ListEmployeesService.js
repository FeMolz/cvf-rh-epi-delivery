import employeeRepository from '../repositories/EmployeeRepository.js';

class ListEmployeesService {
    async execute() {
        return employeeRepository.findAll();
    }
}

export default new ListEmployeesService();
