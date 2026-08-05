import Router from 'express';
import employeeController from '../controllers/EmployeeController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';

const employeeRoutes = Router();

employeeRoutes.post('/', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO']), employeeController.create);
employeeRoutes.get('/', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO']), employeeController.findAll);

employeeRoutes.get(
    '/consulta',
    isAuthenticated,
    authorize(['ADMIN', 'ADMINISTRATIVO']),
    employeeController.consultar
);

employeeRoutes.get(
    '/ferias',
    isAuthenticated,
    authorize(['ADMIN', 'ADMINISTRATIVO']),
    employeeController.listarFerias
);

employeeRoutes.get(
    '/export/lista',
    isAuthenticated,
    authorize(['ADMIN', 'ADMINISTRATIVO']),
    (request, response, next) => employeeController.exportarLista(request, response, next)
);

employeeRoutes.get(
    '/:id/export',
    isAuthenticated,
    authorize(['ADMIN', 'ADMINISTRATIVO']),
    (request, response, next) =>
        employeeController.exportarFuncionarioCompleto(request, response, next)
);

employeeRoutes.get('/:id', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO']), employeeController.findById);
employeeRoutes.put('/:id', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO']), employeeController.update);
employeeRoutes.delete('/:id', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO']), employeeController.delete);

export default employeeRoutes;

