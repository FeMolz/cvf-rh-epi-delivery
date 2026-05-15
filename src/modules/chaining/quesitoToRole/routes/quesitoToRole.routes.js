import express from 'express';

import quesitoToRoleController from '../controllers/QuesitoToRoleController.js';
import { isAuthenticated } from '../../../../shared/middlewares/auth.js';
import { authorize } from '../../../../shared/middlewares/rbac.js';

const { Router } = express;
const quesitoToRoleRoutes = Router();

quesitoToRoleRoutes.post(
    '/',
    isAuthenticated,
    authorize(['ADMIN', 'ADMINISTRATIVO']),
    (req, res, next) => quesitoToRoleController.link(req, res, next)
);

quesitoToRoleRoutes.delete(
    '/:roleId/:quesitoId',
    isAuthenticated,
    authorize(['ADMIN', 'ADMINISTRATIVO']),
    (req, res, next) => quesitoToRoleController.unlink(req, res, next)
);

quesitoToRoleRoutes.get(
    '/:roleId',
    isAuthenticated,
    authorize(['ADMIN', 'ADMINISTRATIVO']),
    (req, res, next) => quesitoToRoleController.listByRole(req, res, next)
);

export default quesitoToRoleRoutes;
