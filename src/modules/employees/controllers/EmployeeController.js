import createEmployeeService from '../services/CreateEmployeeService.js';
import employeeRepository from '../repositories/EmployeeRepository.js';

class EmployeeController {
    async create(req, res) {
        try {
            const { name, cpf, status, admissionDate, resignationDate, companyId } = req.body;
            const employee = await createEmployeeService.execute({ name, cpf, status, admissionDate, resignationDate, companyId });

            return res.status(201).json(employee);

        } catch (error) {
            if (error.message) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async findAll(req, res) {
        try {
            const employees = await employeeRepository.findAll();

            return res.json(employees);

        } catch (error) {
            console.error('Error finding employees:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async findById(req, res) {
        try {
            const { id } = req.params;
            const employee = await employeeRepository.findById(id);

            if (!employee) {
                return res.status(404).json({ error: 'Funcionário não encontrado' });
            }

            return res.json(employee);

        } catch (error) {
            console.error('Error finding employee:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const employee = await employeeRepository.update(id, data);

            return res.json(employee);

        } catch (error) {
            console.error('Error updating employee:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const employee = await employeeRepository.delete(id);

            return res.json(employee);

        } catch (error) {
            if (error.code === 'NOT_FOUND') {
                return res.status(404).json({ error: 'Funcionário não encontrado' });
            }
            console.error('Error deleting employee:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default new EmployeeController();
