import express from 'express';
const { Router } = express;

import epiDeliveryController from '../controllers/EpiDeliveryController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';

const epiDeliveryRoutes = Router();

// Rota POST para registrar uma entrega (Acesso: ADMIN, ADMINISTRATIVO, ALMOXARIFADO)
epiDeliveryRoutes.post('/', isAuthenticated, authorize('ADMIN', 'ADMINISTRATIVO', 'ALMOXARIFADO'), epiDeliveryController.create);

// Rota GET para listar entregas de um funcionário (Acesso: ADMIN, ADMINISTRATIVO, ALMOXARIFADO)
epiDeliveryRoutes.get('/employee/:employeeId', isAuthenticated, authorize('ADMIN', 'ADMINISTRATIVO', 'ALMOXARIFADO'), epiDeliveryController.listByEmployee);

export default epiDeliveryRoutes;
