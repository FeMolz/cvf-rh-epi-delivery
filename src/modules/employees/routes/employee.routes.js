import Router from 'express';
import employeeController from '../controllers/EmployeeController.js';
import { isAuthenticated } from "../../../shared/middlewares/auth.js";
import { authorize } from "../../../shared/middlewares/rbac.js";

const emplooyeeRoutes = Router();

emplooyeeRoutes.post('/', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO']), employeeController.create);

emplooyeeRoutes.get('/', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO']), employeeController.findAll);

emplooyeeRoutes.get('/:id', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO']), employeeController.findById);

emplooyeeRoutes.put('/:id', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO']), employeeController.update);

emplooyeeRoutes.delete('/:id', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO']), employeeController.delete);

export default emplooyeeRoutes;