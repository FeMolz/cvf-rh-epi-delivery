import express from 'express';
const { Router } = express;

import epiToRoleController from '../controllers/EpiToRoleController.js';
import { isAuthenticated } from '../../../../shared/middlewares/auth.js';
import { authorize } from '../../../../shared/middlewares/rbac.js';

const epiToRoleRoutes = Router();

// Ligar EPI a um Cargo
epiToRoleRoutes.post('/', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO']), epiToRoleController.link);

// Desligar EPI de um Cargo
epiToRoleRoutes.delete('/:roleId/:epiId', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO']), epiToRoleController.unlink);

// Listar todos EPIs de um determinado Cargo
epiToRoleRoutes.get('/:roleId', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO', 'ALMOXARIFADO']), epiToRoleController.listByRole);

export default epiToRoleRoutes;
